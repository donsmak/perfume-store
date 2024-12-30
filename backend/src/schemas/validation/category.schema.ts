import { z } from 'zod';
import { idSchema, slugSchema, successResponseSchema } from './common.schema';

const categoryBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  slug: slugSchema,
});

// Request schemas
export const createCategoryRequest = z.object({
  body: categoryBaseSchema.omit({ slug: true }), // slug will be generated
});

export const updateCategoryRequest = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: categoryBaseSchema.partial(),
});

// Response schemas
const categoryResponseSchema = categoryBaseSchema.extend({
  id: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z
    .object({
      products: z.number(),
    })
    .optional(),
});

export const categoryListResponseSchema = successResponseSchema(
  z.object({
    items: z.array(categoryResponseSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
);

export const categoryResponseWrapper = successResponseSchema(categoryResponseSchema);
