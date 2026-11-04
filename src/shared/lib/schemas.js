import { z } from 'zod';

export const signInSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(8).max(256),
  remember: z.boolean().default(false),
});

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9._-]{3,40}$/),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(256),
    confirmPassword: z.string().min(8).max(256),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(25),
  cursor: z.string().max(256).optional(),
});

export function parseOrThrow(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error('Invalid request data');
  return result.data;
}
