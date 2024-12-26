import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { cacheService } from '../services/cache.service';
import { NotFoundError, ValidationError } from '../utils/errors';

const prisma = new PrismaClient();

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: Number(productId),
        order: {
          userId: req.user!.id,
          status: 'DELIVERED',
        },
      },
    });

    if (!hasPurchased) {
      next(new ValidationError('User has not purchased this product'));
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        productId: Number(productId),
        rating,
        comment,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const cacheKey = `reviews:product:${productId}`;

    const reviewData = await cacheService.getOrSet(
      cacheKey,
      async () => {
        const [reviews, stats] = await Promise.all([
          prisma.review.findMany({
            where: { productId: Number(productId) },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.review.groupBy({
            by: ['rating'],
            where: { productId: Number(productId) },
            _count: true,
          }),
        ]);

        return { reviews, stats };
      },
      1800
    );

    res.json(reviewData);
  } catch (error) {
    next(error);
  }
};
