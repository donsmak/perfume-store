import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const getProductReviewsSchema = z.object({
  params: z.object({
    productId: z.coerce.number(),
  }),
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

export const createReviewSchema = z.object({
  body: reviewSchema,
  params: z.object({
    productId: z.coerce.number(),
  }),
});

export const updateReviewSchema = z.object({
  body: reviewSchema,
  params: z.object({
    id: z.coerce.number(),
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
});
