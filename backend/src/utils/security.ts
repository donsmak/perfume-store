import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload, TokenPair } from '../types/auth.types';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { ValidationError } from './errors';

export const hashPassword = (password: string): Promise<string> => {
  return hash(password, 10);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return compare(password, hashedPassword);
};

export const generateToken = (
  payload: { userId: number; role: string },
  expiresIn?: string
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn || process.env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
};

export const generateRefreshToken = (): string => {
  return randomBytes(32).toString('hex');
};

export const generateTokenPair = (payload: JwtPayload): TokenPair => {
  const accessToken = generateToken(payload);
  const refreshToken = generateToken(payload, '7d');

  return {
    accessToken,
    refreshToken,
    refreshTokenExpires: addDays(new Date(), 7),
  };
};

export const validatePassword = (password: string): void => {
  if (password.length < 12) {
    throw new ValidationError('Password must be at least 12 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    throw new ValidationError('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    throw new ValidationError('Password must contain at least one special character');
  }
};
