import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload } from '../types/auth.types';

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
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};
