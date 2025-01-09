import { z } from 'zod';
import { idSchema, slugSchema, priceSchema, successResponseSchema } from './common.schema';

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
  body: z.object({
    name: z.string().min(3).max(255),
    description: z.string().min(10),
    price: z.number().min(0),
    stockQuantity: z.number().int().min(0),
    categoryId: z.number().int().positive(),
    images: z.array(z.string().url()),
    isFeatured: z.boolean().optional(),
  }),
});

export const updateProductRequest = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    name: z.string().min(3).max(255).optional(),
    description: z.string().min(10).optional(),
    price: z.number().min(0).optional(),
    stockQuantity: z.number().int().min(0).optional(),
    categoryId: z.number().int().positive().optional(),
    images: z.array(z.string().url()).optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const getProductRequest = z.object({
  params: z.object({
    slug: z.string(),
  }),
});

export const productFiltersRequest = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1).optional(),
    limit: z.coerce.number().min(1).max(100).default(10).optional(),
    sort: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional(),
    order: z.enum(['asc', 'desc']).default('asc').optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().optional(),
    categoryId: z.coerce.number().optional(),
    search: z.string().optional(),
  }),
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

export type ProductFiltersRequest = z.infer<typeof productFiltersRequest>;
export type GetProductRequest = z.infer<typeof getProductRequest>;
export type CreateProductRequest = z.infer<typeof createProductRequest>;
export type UpdateProductRequest = z.infer<typeof updateProductRequest>;
