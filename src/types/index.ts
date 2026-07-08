export type PlanSlug = 'free' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer' | 'superadmin';
export type ScanStatus = 'queued' | 'scanning' | 'completed' | 'failed';
export type OverallRating = 'A' | 'B' | 'C' | 'D';
export type DomainStatus = 'clean' | 'infected' | 'blacklisted' | 'unknown';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertType =
  | 'malware_detected'
  | 'blacklisted'
  | 'tls_expiring'
  | 'rating_degraded'
  | 'missing_headers';
export type ScanFrequency = 'daily' | 'weekly' | 'monthly';
export type AgentType = 'wordpress_plugin' | 'php_script' | 'python_script';
export type AgentStatus = 'active' | 'inactive' | 'revoked';


export interface Plan {
  id: string;
  slug: PlanSlug;
  name: string;
  price_monthly: string;
  scan_quota: number;
  domain_quota: number;
  agent_quota: number;
  browser_scan_enabled: boolean;
  server_side_scan: boolean;
  pdf_report: boolean;
  api_access: boolean;
  scheduled_scans: boolean;
  slack_notifications: boolean;
  waf_enabled: boolean;
  db_scan_enabled: boolean;
  is_active: boolean;
  localized_price?: string | null;
  localized_currency?: string | null;
}


export type BillingPeriod = 'monthly' | 'yearly';

export interface CashfreeOrder {
  order_id: string;
  subscription_id: string;
  payment_session_id: string;
  subscription_session_id: string;
  amount: string;
  currency: string;
  plan_slug: string;
  plan_name: string;
  billing_period: BillingPeriod;
  auto_renew: boolean;
  dev_mode?: boolean;
  invoice_url?: string;
  subscription_checkout_url?: string;
  cashfree_direct_checkout_url?: string;
  cashfree_environment?: 'SANDBOX' | 'PRODUCTION' | string;
  return_url?: string;
  notify_url?: string;
  cf_subscription_id?: string;
  frontend_url?: string;
  backend_checkout_url?: string;
  subscription_status?: string;
}


export interface Organization {
  id: string;
  name: string;
  plan: string | null;
  plan_name?: string;
  scan_quota_used: number;
  scan_quota_limit: number;
  quota_reset_at: string | null;
  created_at: string;
}


export interface User {
  id: string;
  email: string;
  name: string;
  organization: Organization | null;
  role: UserRole;
  is_email_verified: boolean;
  notify_email: boolean;
  timezone: string;
  created_at: string;
}


export interface ScanSite {
  input: string;
  domain: string;
  final_url: string;
  ip: string[];
  redirects_to: string[];
  cdn: string[];
  running_on: string[];
}


export interface CmsInfo {
  name: string;
  info_url: string;
  theme: string | null;
  directory: string | null;
}

export interface ScanSoftware {
  cms: CmsInfo[];
  server: { name: string }[];
  language: string | null;
  plugins: string[];
}


export interface ScanLinks {
  iframes: string[];
  js_external: string[];
  js_local: string[];
  urls: string[];
}


export interface TlsInfo {
  cert_expires: string;
  cert_issuer: string;
  cert_authority: string;
}

export interface TlsDirectInfo {
  tls_version: string;
  cipher_suite: string;
  cert_subject: string;
  cert_issuer: string;
  cert_not_after: string;
  cert_days_remaining: number;
  cert_expired: boolean;
  cert_expiring_soon: boolean;
  san: string[];
  ocsp_stapling: boolean;
  hsts: boolean;
  hsts_max_age: number | null;
  error: string | null;
}


export interface WhoisInfo {
  registrar: string | null;
  registrar_url?: string | null;
  creation_date: string | null;
  expiration_date: string | null;
  updated_date: string | null;
  name_servers: string[];
  status: string[];
  registrant_name: string | null;
  registrant_org: string | null;
  registrant_country: string | null;
  domain_age_days: number | null;
  error: string | null;
}


export interface RatingScore {
  rating: OverallRating;
  passed?: string;
}

export interface ScanRatings {
  total: RatingScore;
  security: RatingScore;
  domain: RatingScore;
  tls: RatingScore;
}


export interface ScanRecommendations {
  security_minor?: Record<string, Record<string, unknown>>;
  headers_minor?: Record<string, Record<string, unknown>>;
  tls_minor?: Record<string, Record<string, unknown>>;
}


export interface MalwareFinding {
  signature_id: string;
  name: string;
  severity: AlertSeverity;
  type: string;
  source: string;
  source_url: string;
  matched_snippet: string;
}

export interface MalwareInfo {
  detected: boolean;
  scanned_bytes: number;
  scanned_files: string[];
  findings: MalwareFinding[];
  error: string | null;
}


export interface MaliciousRequest {
  url: string;
  type: string;
  triggered_by: string;
  finding: string;
  name: string;
  severity: AlertSeverity;
}

export interface BrowserScanInfo {
  available: boolean;
  plan_required: string;
  detected: boolean;
  page_load_ms: number;
  total_requests_intercepted: number;
  malicious_requests: MaliciousRequest[];
  redirects: string[];
  console_errors: string[];
  error: string | null;
}


export interface BlacklistProviders {
  google_safe_browsing: boolean;
  mcafee: boolean;
  phishtank: boolean;
  norton_safe_web: boolean;
  yandex: boolean;
  opera: boolean;
  spamhaus: boolean;
}

export interface BlacklistInfo {
  listed: boolean;
  data_source: string;
  providers: BlacklistProviders;
}


export interface OurScannerResult {
  layer1_detected: boolean;
  layer2_detected: boolean;
  overall_detected: boolean;
  layer1_findings_count: number;
  layer2_findings_count: number;
  note: string;
}


export interface ScanDetail {
  id: string;
  url: string;
  domain: string;
  status: ScanStatus;
  rating: OverallRating | null;
  malware_detected: boolean;
  blacklisted: boolean;
  organization: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  notify_email: boolean;
  was_cached: boolean;
  site: ScanSite;
  software: ScanSoftware;
  links: ScanLinks;
  tls: TlsInfo;
  tls_direct: TlsDirectInfo;
  whois: WhoisInfo;
  ratings: ScanRatings;
  recommendations: ScanRecommendations | null;
  malware: MalwareInfo;
  malware_findings_detail: MalwareFinding[];
  browser_scan: BrowserScanInfo;
  blacklists: BlacklistInfo;
  our_scanner: OurScannerResult;
}


export interface ScanListItem {
  id: string;
  domain: string;
  url: string;
  status: ScanStatus;
  rating: OverallRating | null;
  malware_detected: boolean;
  blacklisted: boolean;
  created_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}


export interface PublicScanCreated {
  scan_id: string;
  status: ScanStatus;
  domain: string;
  created_at: string;
  estimated_duration_seconds: number;
}


export interface ScanStatusPoll {
  id: string;
  status: ScanStatus;
  progress_percent: number;
  estimated_seconds_remaining: number;
}


export interface Domain {
  id: string;
  domain: string;
  last_status: DomainStatus;
  last_scan_id: string | null;
  last_rating: OverallRating | null;
  is_active: boolean;
  frequency: ScanFrequency;
  notify_email: boolean;
  slack_webhook_url: string | null;
  created_at: string;
}


export interface Alert {
  id: string;
  organization?: string;
  domain: string | null;
  scan_domain?: string | null;
  scan?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  is_resolved: boolean;
  resolved_by?: string | null;
  resolved_note?: string | null;
  resolved_at: string | null;
  created_at: string;
}


export interface Invoice {
  id: string;
  amount: string;
  currency: string;
  status: 'paid' | 'open' | 'void';
  description: string;
  period_start: string;
  period_end: string;
  created_at: string;
  invoice_pdf: string | null;
}


export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  revoked: boolean;
  last_used_at: string | null;
  created_by: string;
  created_at: string;
}


export interface ServerAgent {
  id: string;
  name: string;
  type: AgentType;
  token_prefix: string;
  domain: { id: string; domain: string } | null;
  status: AgentStatus;
  version: string;
  last_seen_at: string | null;
  last_scan_at: string | null;
  revoked: boolean;
  created_at: string;
}


export interface PaginatedResponse<T> {
  results: T[];
  count: number | null;
  next: string | null;
  previous: string | null;
  page_size: number;
}


export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterResponse {
  user: User;
}


export interface DashboardStats {
  total_scans: number;
  clean_scans: number;
  issues_found: number;
  active_alerts: number;
  quota_used: number;
  quota_total: number;
}


export interface AnalyticsData {
  total_scans: number;
  malware_detected_count: number;
  blacklisted_count: number;
  open_alerts_count: number;
  rating_distribution: Record<string, number>;
  scans_over_time: unknown[];
  top_domains_by_scans: unknown[];
  quota_used: number;
  quota_limit: number;
}


export type MalwareSignatureLayer = 'static' | 'browser' | 'server';
export type MalwareSignatureSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface MalwareSignature {
  id: string;
  signature_id: string;
  name: string;
  layer: MalwareSignatureLayer;
  pattern: string;
  severity: MalwareSignatureSeverity;
  type: string;
  description: string;
  is_active: boolean;
  auto_updated: boolean;
  created_at: string;
  updated_at: string;
}


export interface AgentFinding {
  type: string;
  severity: string;
  description: string;
  url: string;
  matched_snippet: string;
}


export interface ServerScanResult {
  id: string;
  files_scanned: number;
  files_infected: number;
  findings: AgentFinding[];
  scan_duration_ms: number;
  malware_found: boolean;
  agent_version: string | null;
  created_at: string;
}
