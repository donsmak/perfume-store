import { z } from 'zod';

export const PaymentMethod = z.enum(['BANK_TRANSFER', 'CASH_ON_DELIVERY']);

export const createOrderRequest = z.object({
  body: z.object({
    shippingAddress: z.union([
      z.object({
        id: z.number(),
      }),
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().optional(),
        country: z.string().min(1),
        zipCode: z.string().min(1),
        phone: z.string().min(1),
      }),
    ]),
    paymentMethod: PaymentMethod,
    bankTransferDetails: z
      .object({
        bankName: z.string().min(1),
        accountNumber: z.string().min(1),
        accountName: z.string().min(1),
      })
      .optional(),
    totalAmount: z.number().min(0),
  }),
});

export const getOrderRequest = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
});

export type CreateOrderRequest = z.infer<typeof createOrderRequest>;
export type GetOrderRequest = z.infer<typeof getOrderRequest>;
export type PaymentMethod = z.infer<typeof PaymentMethod>;
