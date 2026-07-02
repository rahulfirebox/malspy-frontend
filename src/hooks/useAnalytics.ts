'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { useAuthStore } from '@/stores/authStore';

export function useAnalytics(lookback = 30) {
  const userId = useAuthStore(s => s.user?.id);

  return useQuery({
    queryKey: ['analytics', userId, lookback],
    queryFn: () => analyticsService.getAnalytics(lookback),
    staleTime: 300_000,
    enabled: !!userId,
  });
}
