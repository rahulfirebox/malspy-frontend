import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email required').min(1),
  password: z.string().min(1, 'Password required'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

const RegisterFieldsSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  email: z.string().trim().toLowerCase().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  org_name: z.string().max(200).optional(),
});

export const RegisterSchema = RegisterFieldsSchema;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const RegisterFormSchema = RegisterFieldsSchema.extend({
  confirm_password: z.string().min(1, 'Confirm password required'),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});
export type RegisterFormInput = z.infer<typeof RegisterFormSchema>;

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

export const ContactRequestSchema = z.object({
  name: z.string().trim().min(1, 'Name required').max(200),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().toLowerCase().email('Valid email required'),
  message: z.string().trim().min(1, 'Message required').max(5000),
});
export type ContactRequestInput = z.infer<typeof ContactRequestSchema>;
