export const ALERT_SEVERITY_FILTER_OPTIONS = [
  { value: '', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
] as const;

export const ALERT_STATUS_FILTER_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
] as const;

export const ALERT_TYPE_FILTER_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'malware_detected', label: 'Malware Detected' },
  { value: 'blacklisted', label: 'Blacklisted' },
  { value: 'tls_expiring', label: 'SSL Expiring' },
  { value: 'missing_headers', label: 'Missing Headers' },
] as const;

export const DEFAULT_ALERT_STATUS = 'open';

export const ALERT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ALERT_TYPE_FILTER_OPTIONS.filter(opt => opt.value).map(opt => [opt.value, opt.label])
);
