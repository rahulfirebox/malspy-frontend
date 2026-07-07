export const DOMAIN_FREQUENCY_OPTIONS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
] as const;

export type DomainFrequencyKey = (typeof DOMAIN_FREQUENCY_OPTIONS)[number]['key'];

export const DOMAIN_FREQUENCY_KEYS = DOMAIN_FREQUENCY_OPTIONS.map(o => o.key) as [
  DomainFrequencyKey,
  ...DomainFrequencyKey[],
];

export function getFrequencyLabel(key: string): string {
  return DOMAIN_FREQUENCY_OPTIONS.find(o => o.key === key)?.label ?? key;
}
