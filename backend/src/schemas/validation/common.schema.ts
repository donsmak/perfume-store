import { z } from 'zod';

// Basic field schemas
export const idSchema = z.number().int().positive();
export const slugSchema = z
  .string()
  .min(3)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const priceSchema = z.number().min(0).multipleOf(0.01);

// Pagination and sorting
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Common request parameters
export const idParamsSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

// Common response schemas
export const errorResponseSchema = z.object({
  status: z.literal('error'),
  message: z.string(),
  code: z.string().optional(),
});

export const successResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    status: z.literal('success'),
    data: dataSchema,
    message: z.string().optional(),
  });
