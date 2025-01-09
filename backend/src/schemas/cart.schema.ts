import { z } from 'zod';
import { idSchema, priceSchema, successResponseSchema } from './common.schema';

const cartItemBaseSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().positive(),
  price: priceSchema,
});

// Request schemas
export const addItemSchema = z.object({
  body: z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  }),
});

export const updateItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().positive(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const removeItemSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const cartItemResponseSchema = cartItemBaseSchema.extend({
  id: idSchema,
  cartId: idSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  product: z.object({
    id: idSchema,
    name: z.string(),
    price: priceSchema,
    image: z.string(),
  }),
});

const cartResponseSchema = z.object({
  id: idSchema,
  userId: idSchema.nullable(),
  sessionId: z.string().nullable(),
  total: priceSchema,
  items: z.array(cartItemResponseSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const cartResponseWrapper = successResponseSchema(cartResponseSchema);
