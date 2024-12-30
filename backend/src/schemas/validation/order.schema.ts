import { z } from 'zod';
import { idSchema, priceSchema, successResponseSchema } from './common.schema';

export const orderStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'CONFIRMED',
]);

export const paymentMethodSchema = z.enum(['CASH_ON_DELIVERY', 'BANK_TRANSFER', 'STORE_PICKUP']);

const bankTransferSchema = z.object({
  bankName: z.string(),
  accountNumber: z.string(),
  accountHolder: z.string(),
  transferAmount: priceSchema,
  reference: z.string(),
});

// Request schemas
export const createOrderRequest = z.object({
  body: z.object({
    addressId: idSchema,
    paymentMethod: paymentMethodSchema,
    bankTransferDetails: bankTransferSchema.optional(),
  }),
});

export const updateOrderStatusRequest = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: z.object({
    status: orderStatusSchema,
  }),
});

// Response schemas
const orderItemResponseSchema = z.object({
  id: idSchema,
  orderId: idSchema,
  productId: idSchema,
  quantity: z.number().int().positive(),
  price: priceSchema,
  product: z.object({
    name: z.string(),
    image: z.string(),
  }),
});

const orderResponseSchema = z.object({
  id: idSchema,
  userId: idSchema,
  status: orderStatusSchema,
  total: priceSchema,
  paymentMethod: paymentMethodSchema,
  bankTransferDetails: bankTransferSchema.optional(),
  items: z.array(orderItemResponseSchema),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const orderListResponseSchema = successResponseSchema(
  z.object({
    items: z.array(orderResponseSchema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
);

export const orderResponseWrapper = successResponseSchema(orderResponseSchema);
