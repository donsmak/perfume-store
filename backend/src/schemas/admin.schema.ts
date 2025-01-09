import { z } from 'zod';

export const updateUserRoleSChema = z.object({
  body: z.object({
    role: z.enum(['ADMIN', 'USER']),
  }),
});
