import apiClient from './apiClient';
import { parsePaginatedResponse } from '@/lib/apiUtils';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { Alert, PaginatedResponse } from '@/types';

export const alertService = {
  async listAlerts(params?: {
    q?: string;
    severity?: string;
    type?: string;
    is_resolved?: boolean;
    cursor?: string;
    page_size?: number;
  }): Promise<PaginatedResponse<Alert>> {
    const res = await apiClient.get(API.alerts.list, { params });
    return parsePaginatedResponse<Alert>(res);
  },

  async getRecentAlerts(): Promise<PaginatedResponse<Alert>> {
    const res = await apiClient.get(API.alerts.list, {
      params: { is_resolved: false, page_size: 5 },
    });
    return parsePaginatedResponse<Alert>(res);
  },

  async resolveAlert(id: string, note?: string): Promise<Alert> {
    const res = await apiClient.patch<Alert>(API.alerts.detail(id), {
      resolved_note: note ?? '',
      is_resolved: true,
    });
    return res.data;
  },
};
