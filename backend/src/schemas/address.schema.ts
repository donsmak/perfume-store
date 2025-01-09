import { z } from 'zod';
import { idSchema, successResponseSchema } from './common.schema';

const addressBaseSchema = z.object({
  street: z.string().min(3, 'Street must be at least 3 characters long'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('Morocco'),
  isDefault: z.boolean().optional().default(false),
});

export const createAddressRequest = z.object({
  body: addressBaseSchema,
});

export const updateAddressRequest = z.object({
  params: z.object({
    id: idSchema,
  }),
  body: addressBaseSchema.partial(),
});

const addressResponseSchema = addressBaseSchema.extend({
  id: idSchema,
  userId: idSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const addressResponseWrapper = successResponseSchema(addressResponseSchema);
export const addressListResponseWrapper = successResponseSchema(z.array(addressResponseSchema));
