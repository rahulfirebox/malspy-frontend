'use client';

import { useEffect, useRef, useState } from 'react';
import apiClient from '@/services/apiClient';

const HEALTH_CHECK_INTERVAL_MS = 60_000;
const enabled = process.env.NEXT_PUBLIC_ENABLE_API_HEALTH_CHECK !== 'false';

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const isHealthyRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let interval: ReturnType<typeof setInterval>;

    const check = async () => {
      if (document.hidden) return;

      setIsChecking(true);
      try {
        await apiClient.get('/health/ready/', { timeout: 5000 });
        if (!cancelled) {
          isHealthyRef.current = true;
          setIsHealthy(true);
        }
      } catch {
        if (!cancelled) {
          isHealthyRef.current = false;
          setIsHealthy(false);
        }
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    const onVisible = () => {
      if (!document.hidden && !isHealthyRef.current) void check();
    };

    void check();
    interval = setInterval(check, HEALTH_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return { isHealthy: enabled ? isHealthy : true, isChecking };
}
