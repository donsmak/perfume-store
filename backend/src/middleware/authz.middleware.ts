import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../utils/errors';

export const authorize = (permittedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (userRole && permittedRoles.includes(userRole)) {
      next();
    } else {
      next(new AuthenticationError('Unauthorized'));
    }
  };
};
