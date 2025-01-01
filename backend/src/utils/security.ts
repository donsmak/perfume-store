import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload } from '../types/auth.types';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';

export const hashPassword = (password: string): Promise<string> => {
  return hash(password, 10);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return compare(password, hashedPassword);
};

export const generateToken = (payload: { userId: number; role: string }): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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

export const generateTokenPair = (payload: { userId: number; role: string }) => {
  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken();
  const refreshTokenExpires = addDays(new Date(), 7);

  return { accessToken, refreshToken, refreshTokenExpires };
};
