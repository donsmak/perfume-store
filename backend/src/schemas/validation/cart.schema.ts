import { z } from 'zod';
import { idSchema, priceSchema, successResponseSchema } from './common.schema';

// Base schemas
const cartItemBaseSchema = z.object({
  productId: idSchema,
  quantity: z.number().int().positive(),
  price: priceSchema,
});

// Request schemas
export const addToCartRequest = z.object({
  body: z.object({
    productId: idSchema,
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

export const updateCartItemRequest = z.object({
  params: z.object({
    itemId: idSchema,
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

// Response schemas
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
