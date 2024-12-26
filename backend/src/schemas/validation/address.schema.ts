import { z } from 'zod';

const addressBaseSchema = {
  street: z.string().min(3, 'Street must be at least 3 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State/Region must be at least 2 characters'),
  postalCode: z.string().regex(/^\d{5}$/, 'Invalid Moroccan postal code format'),
  isDefault: z.boolean().optional().default(false),
};

export const addressSchema = z.object({
  body: z.object(addressBaseSchema),
});

export const updateAddressSchema = z.object({
  params: z.object({
    addressId: z.string().regex(/^\d+$/, 'Invalid address ID'),
  }),
  body: z.object(addressBaseSchema),
});

export const addressIdSchema = z.object({
  params: z.object({
    addressId: z.string().regex(/^\d+$/, 'Invalid address ID'),
  }),
});
