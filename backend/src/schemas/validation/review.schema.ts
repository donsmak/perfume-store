import { z } from 'zod';
import { idSchema, successResponseSchema } from './common.schema';

const reviewBaseSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  productId: idSchema,
});

export const createReviewSchema = z.object({
  body: reviewBaseSchema,
});

export const updateReviewSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: reviewBaseSchema.partial(),
});

export const reviewResponseSchema = reviewBaseSchema.extend({
  id: idSchema,
  userId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  user: z.object({
    id: idSchema,
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const reviewListResponseSchema = successResponseSchema(
  z.object({
    items: z.array(reviewResponseSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
);

export const reviewResponseWrapper = successResponseSchema(reviewResponseSchema);
