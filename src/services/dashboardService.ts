import apiClient from './apiClient';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      API.dashboard.analytics
    );
    return res.data.data;
  },
};
