'use client';
import { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';

export function useApiHealth() {
  const [isHealthy, setIsHealthy] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const check = async () => {
      setIsChecking(true);
      try {
        await apiClient.get('/health/ready/', { timeout: 5000 });
        setIsHealthy(true);
      } catch {
        setIsHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    check();
    interval = setInterval(check, isHealthy ? 60_000 : 10_000);
    return () => clearInterval(interval);
  }, [isHealthy]);

  return { isHealthy, isChecking };
}
