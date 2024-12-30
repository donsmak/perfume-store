import { z } from 'zod';
import { successResponseSchema } from './common.schema';

// Request schemas
export const registerRequest = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      ),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z
      .string()
      .regex(/^(0[567])\d{8}$/, 'Invalid Moroccan phone number format (e.g., 0612345678)'),
  }),
});

export const loginRequest = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const resetPasswordRequest = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

// Response schemas
const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  role: z.string(),
  isEmailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const authResponseSchema = successResponseSchema(
  z.object({
    token: z.string(),
    user: userSchema,
  })
);
