import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
