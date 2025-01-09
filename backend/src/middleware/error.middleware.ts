import { Request, Response, NextFunction } from 'express';
import { ApiError, NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong',
  });
};
