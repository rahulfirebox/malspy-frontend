import { z } from 'zod';

export const AddDomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain required')
    .max(500)
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Enter a valid domain name'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  notify_email: z.boolean().default(true),
  slack_webhook_url: z.string().url().nullable().default(null),
});
export type AddDomainInput = z.infer<typeof AddDomainSchema>;
