import type { PlanSlug } from '@/types';

export const PLAN_FEATURES: Record<PlanSlug, string[]> = {
  free: ['5 scans / month', '1 monitored domain', 'Basic report', 'Layer 1 scanner'],
  pro: [
    '100 scans / month',
    '10 monitored domains',
    'PDF reports',
    'Layer 1 + Layer 2 scanner',
    'Scheduled scans',
    'Slack notifications',
  ],
  enterprise: [
    'Unlimited scans',
    'Unlimited domains',
    'API access',
    'WAF enabled',
    'DB scan',
    'Priority support',
  ],
};
