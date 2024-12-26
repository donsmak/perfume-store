import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.number().int().positive('Invalid product ID'),
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    itemId: z.string().regex(/^\d+$/, 'Invalid cart item ID'),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.number().int().positive('Invalid address ID'),
    paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'STRIPE'], {
      errorMap: () => ({ message: 'Invalid payment method' }),
    }),
  }),
});
