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
  image: z.string().min(1),
  categoryId: idSchema,
});

// Request schemas
export const createProductRequest = z.object({
  body: productBaseSchema.omit({ slug: true }),
});

export const updateProductRequest = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: productBaseSchema.partial(),
});

export const getProductRequest = z.object({
  params: z.object({
    slug: slugSchema,
  }),
});

export const productFiltersRequest = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional().default(1),
      limit: z.coerce.number().int().min(1).max(100).optional().default(10),
      category: z.string().optional(),
      brand: z.string().optional(),
      minPrice: z.coerce.number().optional(),
      maxPrice: z.coerce.number().optional(),
      featured: z.coerce.boolean().optional(),
      bestseller: z.coerce.boolean().optional(),
      sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest']).optional(),
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
