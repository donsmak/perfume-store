import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors';
import {
  comparePasswords,
  generateToken,
  generateTokenPair,
  hashPassword,
} from '../utils/security';
import { randomBytes } from 'crypto';
import { addHours, addDays } from 'date-fns';
import { sendPasswordResetEmail, sendVerificationEmail } from '../utils/email';
import { formatResponse } from '../utils/formatters';
import { logger } from '../utils/logger';
export class AuthController {
  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      const verificationToken = randomBytes(32).toString('hex');

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ValidationError('User already exists');
      }

      const hashedPassword = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'USER',
          verificationToken,
          isEmailVerified: false,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verificationToken: true,
        },
      });

      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (error) {
        logger.error(`Error sending verification email: ${error}`);
      }

      const { verificationToken: _, ...userWithoutToken } = user;

      res.status(201).json(
        formatResponse({
          user: userWithoutToken,
          message: 'User registered successfully. Please check your email to verify your account.',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isValidPassword = await comparePasswords(password, user.password);

      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = generateTokenPair({ userId: user.id, role: user.role });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: token.refreshToken,
          refreshTokenExpires: token.refreshTokenExpires,
        },
      });

      res.json(
        formatResponse({
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          message: 'User logged in successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.query;

      if (!token) {
        throw new ValidationError('Verification token is required');
      }

      const user = await prisma.user.findFirst({
        where: {
          verificationToken: String(token),
        },
      });

      if (!user) {
        throw new ValidationError('Invalid or expired verification token');
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          verificationToken: null,
        },
      });

      const tokens = generateTokenPair({ userId: user.id, role: user.role });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: tokens.refreshToken,
          refreshTokenExpires: tokens.refreshTokenExpires,
        },
      });

      res.json(
        formatResponse({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          message: 'Email verified successfully',
          redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new ValidationError('Invalid or expires reset token');
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      res.json(
        formatResponse({
          message: 'Password reset successfully',
        })
      );
    } catch (error) {}
  };

  public forgetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;
      const resetToken = randomBytes(32).toString('hex');
      const resetPasswordExpires = addHours(new Date(), 1);

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires,
          },
        });

        await sendPasswordResetEmail(email, resetToken);
      }

      res.json(
        formatResponse({
          message: 'Password reset email sent successfully',
        })
      );
    } catch (error) {
      next(error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          refreshToken,
          refreshTokenExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid refresh token');
      }

      const tokens = generateTokenPair({ userId: user.id, role: user.role });

      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: tokens.refreshToken,
          refreshTokenExpires: tokens.refreshTokenExpires,
        },
      });

      res.json(
        formatResponse({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        })
      );
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      await prisma.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpires: null,
        },
      });

      res.json(formatResponse({ message: 'logged out successfully' }));
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json(formatResponse({ user }));
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.update({
        where: { id: req.user?.id },
        data: req.body,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json(formatResponse({ user }));
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const isValidPassword = await comparePasswords(currentPassword, user.password);

      if (!isValidPassword) {
        throw new ValidationError('Current password is incorrect');
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      res.json(formatResponse({ message: 'Password changed successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
