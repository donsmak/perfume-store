import { z } from 'zod';

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/, 'Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    trackingNumber: z.string().optional(),
    adminNotes: z.string().optional(),
  }),
});
