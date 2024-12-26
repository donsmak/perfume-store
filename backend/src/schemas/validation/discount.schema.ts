import { z } from 'zod';

export const createDiscountSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .min(3, 'Code must be at least 3 characters')
        .max(20, 'Code must not exceed 20 characters')
        .regex(
          /^[A-Z0-9_-]+$/,
          'Code must contain only uppercase letters, numbers, underscores, and hyphens'
        ),
      type: z.enum(['PERCENTAGE', 'FIXED']),
      amount: z
        .number()
        .positive('Amount must be positive')
        .refine(
          (val) => {
            if (val > 100 && val > 1000000) {
              return false;
            }
            return true;
          },
          (val) => ({
            message:
              val > 100
                ? 'Percentage discount cannot exceed 100%'
                : 'Fixed discount cannot exceed 1,000,000 MAD',
          })
        ),
      validFrom: z.string().datetime(),
      validUntil: z.string().datetime(),
      minPurchase: z.number().min(0, 'Minimum purchase amount cannot be negative'),
      maxUses: z.number().int().positive('Maximum uses must be positive').optional(),
      perUserLimit: z.number().int().positive('Per user limit must be positive').optional(),
    })
    .refine(
      (data) => {
        const validFrom = new Date(data.validFrom);
        const validUntil = new Date(data.validUntil);
        return validFrom < validUntil;
      },
      {
        message: 'Valid until date must be after valid from date',
        path: ['validUntil'],
      }
    ),
});

export const validateDiscountSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Discount code is required'),
    cartTotal: z.number().positive('Cart total must be positive'),
  }),
});
