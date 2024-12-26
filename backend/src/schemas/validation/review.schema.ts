import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('Invalid product ID'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    comment: z
      .string()
      .min(10, 'Comment must be at least 10 characters')
      .max(1000, 'Comment must not exceed 1000 characters')
      .regex(
        /^[\u0600-\u06FFa-zA-Z0-9\s.,!?-]*$/,
        'Comment can contain Arabic, English letters, numbers, and basic punctuation'
      ),
  }),
});

export const getReviewsSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID'),
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Invalid page number').optional(),
    limit: z.string().regex(/^\d+$/, 'Invalid limit').optional(),
    sort: z.enum(['newest', 'rating_high', 'rating_low']).optional(),
    language: z.enum(['ar', 'fr', 'en']).optional(),
  }),
});
