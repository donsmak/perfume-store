import { z } from 'zod';
import {
  idSchema,
  slugSchema,
  priceSchema,
  paginationSchema,
  successResponseSchema,
} from './common.schema';

// Base product schema
const productBaseSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  slug: slugSchema,
  brand: z.string().min(2),
  price: priceSchema,
  volume: z.string(),
  stockQuantity: z.number().int().min(0),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  image: z.string().url(),
  categoryId: idSchema,
  topNotes: z.string(),
  middleNotes: z.string(),
  baseNotes: z.string(),
});

// Request schemas
export const createProductRequest = z.object({
  body: productBaseSchema.omit({ slug: true }), // slug will be generated
});

export const updateProductRequest = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: productBaseSchema.partial(),
});

export const getProductRequest = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const productFiltersRequest = z.object({
  query: z
    .object({
      page: z.number().int().min(1).optional().default(1),
      limit: z.number().int().min(1).max(100).optional().default(10),
      category: z.string().optional(),
      brand: z.string().optional(),
      minPrice: priceSchema.optional(),
      maxPrice: priceSchema.optional(),
      featured: z.boolean().optional(),
      bestseller: z.boolean().optional(),
      sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest']).optional(),
      notes: z.array(z.string()).optional(),
    })
    .optional(),
});

// Response schemas
const productResponseSchema = productBaseSchema.extend({
  id: idSchema,
  averageRating: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z
    .object({
      id: idSchema,
      name: z.string(),
      slug: slugSchema,
    })
    .optional(),
});

export const productListResponseSchema = successResponseSchema(
  z.object({
    items: z.array(productResponseSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
);

export const productResponseWrapper = successResponseSchema(productResponseSchema);
