export const DOMAIN_SCHEDULE_FILTER_OPTIONS = [
  { value: '', label: 'All schedules' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

export const DOMAIN_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'clean', label: 'Clean' },
  { value: 'infected', label: 'Infected' },
  { value: 'blacklisted', label: 'Blacklisted' },
  { value: 'unknown', label: 'Unknown' },
] as const;
