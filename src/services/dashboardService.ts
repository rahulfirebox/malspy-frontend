import apiClient from './apiClient';
import { API } from '@/lib/apiEndpoints';
import { unwrapApiData } from '@/lib/apiUtils';
import type { DashboardStats } from '@/types';

const EMPTY_STATS: DashboardStats = {
  total_scans: 0,
  clean_scans: 0,
  issues_found: 0,
  active_alerts: 0,
  quota_used: 0,
  quota_total: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readQuotaLimit(data: Record<string, unknown>): number {
  return Number(data.quota_limit ?? data.quota_total ?? 0);
}

function toDashboardStats(body: unknown): DashboardStats {
  const data = unwrapApiData<Record<string, unknown>>(body);
  if (!isRecord(data)) return EMPTY_STATS;

  if ('clean_scans' in data || 'issues_found' in data || 'active_alerts' in data) {
    return {
      total_scans: Number(data.total_scans ?? 0),
      clean_scans: Number(data.clean_scans ?? 0),
      issues_found: Number(data.issues_found ?? 0),
      active_alerts: Number(data.active_alerts ?? 0),
      quota_used: Number(data.quota_used ?? 0),
      quota_total: readQuotaLimit(data),
    };
  }

  const totalScans = Number(data.total_scans ?? 0);
  const malware = Number(data.malware_detected_count ?? 0);
  const blacklisted = Number(data.blacklisted_count ?? 0);
  const issues = malware + blacklisted;

  return {
    total_scans: totalScans,
    clean_scans: Math.max(0, totalScans - issues),
    issues_found: issues,
    active_alerts: Number(data.open_alerts_count ?? 0),
    quota_used: Number(data.quota_used ?? 0),
    quota_total: readQuotaLimit(data),
  };
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get(API.dashboard.analytics);
    return toDashboardStats(res.data);
  },
};
