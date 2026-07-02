import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email required').min(1),
  password: z.string().min(1, 'Password required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  email: z.string().trim().toLowerCase().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  org_name: z.string().max(200).optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email required'),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Confirm password required'),
  })
  .refine(d => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
