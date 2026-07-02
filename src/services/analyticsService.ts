import apiClient from './apiClient';
import { API } from '@/lib/apiEndpoints';
import type {} from '@/lib/schemas/responses';
import type { AnalyticsData } from '@/types';

export const analyticsService = {
  async getAnalytics(days = 30): Promise<AnalyticsData> {
    const res = await apiClient.get<{ success: boolean; data: AnalyticsData }>(
      API.dashboard.analytics,
      { params: { days } }
    );
    return res.data.data;
  },
};
