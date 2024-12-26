import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

export const isAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ForbiddenError('You shall not pass!');
    }

    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You shall not pass! ADMIN only');
    }

    next();
  } catch (error) {
    next(error);
  }
};
