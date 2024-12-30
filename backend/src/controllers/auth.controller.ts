import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { registerRequest, loginRequest } from '../schemas/validation/auth.schema';
import { comparePasswords, generateToken, hashPassword } from '../utils/security';

export class AuthController {
  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerRequest.parse({ body: req.body });

      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.body.email },
      });

      if (existingUser) {
        throw new ValidationError('User already exists');
      }

      const hashedPassword = await hashPassword(validatedData.body.password);

      const user = await prisma.user.create({
        data: {
          email: validatedData.body.email,
          password: hashedPassword,
          firstName: validatedData.body.firstName,
          lastName: validatedData.body.lastName,
          phone: validatedData.body.phone,
          role: 'USER',
        },
      });

      const token = generateToken({ userId: user.id, role: user.role });

      res.status(201).json({
        status: 'success',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginRequest.parse({ body: req.body });

      const user = await prisma.user.findUnique({
        where: { email: validatedData.body.email },
      });

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isValidPassword = await comparePasswords(validatedData.body.password, user.password);

      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = generateToken({ userId: user.id, role: user.role });

      res.json({
        status: 'success',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
