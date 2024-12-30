import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ZodError) {
    logger.warn(`Validation Failed ${err.errors}`);
    res.status(400).json({
      status: 'error',
      message: 'Validation Failed',
      details: err.errors,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`App Error: ${err.message}`);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Database Error: ${err.message}`);
    res.status(400).json({
      status: 'error',
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
    });
    return;
  }

  logger.error('Unhandled Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  });
};
