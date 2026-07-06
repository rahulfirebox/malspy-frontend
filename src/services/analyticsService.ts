import apiClient from './apiClient';
import { API } from '@/lib/apiEndpoints';
import { unwrapApiData } from '@/lib/apiUtils';
import type { AnalyticsData } from '@/types';

export const analyticsService = {
  async getAnalytics(days = 30): Promise<AnalyticsData> {
    const res = await apiClient.get(API.dashboard.analytics, { params: { days } });
    return unwrapApiData<AnalyticsData>(res.data);
  },
};
