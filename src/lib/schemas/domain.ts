import { z } from 'zod';
import { DOMAIN_FREQUENCY_KEYS } from '@/lib/constants/domainFrequency';

function isValidDomainOrUrl(value: string): boolean {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const { hostname } = new URL(candidate);
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(hostname);
  } catch {
    return false;
  }
}

export const AddDomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain required')
    .max(500)
    .refine(isValidDomainOrUrl, 'Enter a valid domain or URL'),
  frequency: z.enum(DOMAIN_FREQUENCY_KEYS).default('daily'),
  notify_email: z.boolean().default(true),
  slack_webhook_url: z.string().url().nullable().default(null),
});
export type AddDomainInput = z.infer<typeof AddDomainSchema>;
