import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { formatResponse } from '../utils/formatters';
import { NotFoundError, ValidationError } from '../utils/errors';
import { CACHE_KEYS } from '../constants';
import { cacheService } from '../services/cache.service';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

const getProductReviewsSchema = z.object({
  params: z.object({
    productId: z.coerce.number(),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

const createReviewSchema = z.object({
  body: reviewSchema,
  params: z.object({
    productId: z.coerce.number(),
  }),
});

const updateReviewSchema = z.object({
  body: reviewSchema,
  params: z.object({
    id: z.coerce.number(),
  }),
});

const deleteReviewSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
});

export class ReviewController {
  public getProductReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        params: { productId },
        query: { page, limit },
      } = getProductReviewsSchema.parse(req);

      const cacheKey = `${CACHE_KEYS.PRODUCT_REVIEWS}:${productId}:page:${page}:limit:${limit}`;
      const cachedReviews = await cacheService.get(cacheKey);

      if (cachedReviews) {
        res.json(JSON.parse(cachedReviews));
        return;
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: { productId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.review.count({ where: { productId } }),
      ]);

      const formattedReviews = reviews.map((review) => ({
        ...review,
        user: {
          id: review.user.id,
          firstName: review.user.firstName,
          lastName: review.user.lastName,
        },
      }));

      const response = formatResponse({
        items: formattedReviews,
        total,
        page,
        pageSize: limit,
      });

      await cacheService.set(cacheKey, JSON.stringify(response));
      res.json(response);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const {
        body: { rating, comment },
        params: { productId },
      } = createReviewSchema.parse(req);

      const existingReview = await prisma.review.findFirst({
        where: { userId, productId },
      });

      if (existingReview) {
        throw new ValidationError('You have already reviewed this product');
      }

      const review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCTS}*`);
      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCT_REVIEWS}:${productId}*`);
      res.status(201).json(formatResponse(review));
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        body: { rating, comment },
        params: { id },
      } = updateReviewSchema.parse(req);
      const userId = req.user!.id;

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.userId !== userId) {
        throw new ValidationError('You are not authorized to update this review');
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: {
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCTS}*`);
      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCT_REVIEWS}:${review.productId}*`);
      res.json(formatResponse(updatedReview));
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        params: { id },
      } = deleteReviewSchema.parse(req);
      const userId = req.user!.id;

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundError('Review not found');
      }

      if (review.userId !== userId) {
        throw new ValidationError('You are not authorized to delete this review');
      }

      await prisma.review.delete({
        where: { id },
      });

      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCTS}*`);
      await cacheService.delByPattern(`${CACHE_KEYS.PRODUCT_REVIEWS}:${review.productId}*`);
      res.json(formatResponse({ message: 'Review deleted successfully' }));
    } catch (error) {
      next(error);
    }
  };
}
