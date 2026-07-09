export const SCAN_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'scanning', label: 'Scanning' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const;

export const SCAN_RATING_FILTER_OPTIONS = [
  { value: '', label: 'All ratings' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
] as const;

export const SCAN_MALWARE_FILTER_OPTIONS = [
  { value: '', label: 'All malware' },
  { value: 'true', label: 'Detected' },
  { value: 'false', label: 'Clean' },
] as const;

export const SCAN_ORDERING_OPTIONS = [
  { value: '', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
  { value: 'domain', label: 'Domain A–Z' },
  { value: '-domain', label: 'Domain Z–A' },
  { value: 'overall_rating', label: 'Rating best first' },
] as const;

export const SCAN_FILTER_SELECT_CLASS =
  'themed-select w-full border border-border-dark rounded-lg px-3 py-2 text-sm bg-bg-elevated text-text-primary transition-colors hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page';

export const PROTOCOL_SELECT_OPTIONS = [
  { value: 'https', label: 'https' },
  { value: 'http', label: 'http' },
] as const;
