import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { cacheService } from '../services/cache.service';
import { NotFoundError, ValidationError } from '../utils/errors';
const prisma = new PrismaClient();

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await cacheService.getOrSet(
      'categories:all',
      async () => {
        return prisma.category.findMany({
          include: {
            _count: {
              select: { products: true },
            },
          },
        });
      },
      3600
    );

    res.json(categories);
  } catch (error) {
    next(error);
  }
};
