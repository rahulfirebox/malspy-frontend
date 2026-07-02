import { z } from 'zod';

export const PublicScanSchema = z.object({
  url: z
    .string()
    .min(1, 'URL required')
    .url('Enter a valid URL (include https://)')
    .refine(
      v => v.startsWith('http://') || v.startsWith('https://'),
      'Only http/https URLs allowed'
    ),
});
export type PublicScanInput = z.infer<typeof PublicScanSchema>;

export const AuthScanSchema = z.object({
  url: z
    .string()
    .min(1, 'URL required')
    .url('Enter a valid URL (include https://)')
    .refine(
      v => v.startsWith('http://') || v.startsWith('https://'),
      'Only http/https URLs allowed'
    ),
  notify_email: z.boolean().default(true),
  schedule: z.string().nullable().default(null),
});
export type AuthScanInput = z.infer<typeof AuthScanSchema>;
