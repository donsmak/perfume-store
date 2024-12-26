import { z } from 'zod';

const productBaseSchema = {
  name: z.object({
    ar: z.string().min(3, 'Arabic name must be at least 3 characters').optional(),
    fr: z.string().min(3, 'French name must be at least 3 characters'),
    en: z.string().min(3, 'English name must be at least 3 characters').optional(),
  }),
  description: z.object({
    ar: z.string().min(10, 'Arabic description must be at least 10 characters').optional(),
    fr: z.string().min(10, 'French description must be at least 10 characters'),
    en: z.string().min(10, 'English description must be at least 10 characters').optional(),
  }),
  price: z
    .number()
    .positive('Price must be positive')
    .max(100000, 'Price cannot exceed 100,000 MAD'),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative'),
  brand: z.string().min(1, 'Brand is required'),
  categoryId: z.number().int().positive('Category ID is required'),
  volume: z.string().regex(/^\d+(\.\d+)?\s*(ml|ML)$/, 'Volume must be in ml format (e.g., 100ml)'),
  topNotes: z.array(z.string()).min(1, 'At least one top note is required'),
  middleNotes: z.array(z.string()).min(1, 'At least one middle note is required'),
  baseNotes: z.array(z.string()).min(1, 'At least one base note is required'),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  origin: z.string().optional(),
  concentration: z.enum(['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne']),
};

export const createProductSchema = z.object({
  body: z.object(productBaseSchema),
  file: z
    .object({
      fieldname: z.string(),
      originalname: z.string(),
      encoding: z.string(),
      mimetype: z.string().regex(/^image\/(jpeg|png|webp)$/, 'Invalid image format'),
      size: z.number().max(5242880, 'Image size must be less than 5MB'),
      destination: z.string(),
      filename: z.string(),
      path: z.string(),
    })
    .optional(),
});

export const updateProductSchema = z.object({
  params: z.object({
    productId: z.string().regex(/^\d+$/, 'Invalid product ID'),
  }),
  body: z.object(productBaseSchema).partial(),
  file: createProductSchema.shape.file.optional(),
});

export const productFilterSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().regex(/^\d+$/, 'Invalid minimum price').optional(),
    maxPrice: z.string().regex(/^\d+$/, 'Invalid maximum price').optional(),
    featured: z.enum(['true', 'false']).optional(),
    bestseller: z.enum(['true', 'false']).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'bestselling']).optional(),
    concentration: z
      .enum(['Parfum', 'Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne'])
      .optional(),
    page: z.string().regex(/^\d+$/, 'Invalid page number').optional(),
    limit: z.string().regex(/^\d+$/, 'Invalid limit').optional(),
    lang: z.enum(['ar', 'fr', 'en']).default('ar'),
  }),
});
