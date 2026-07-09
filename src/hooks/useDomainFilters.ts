'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { applyPageToSearchParams } from '@/lib/pagination';

const FILTER_KEYS = ['schedule', 'status', 'q'] as const;

export function useDomainFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const schedule = searchParams.get('schedule') ?? '';
  const status = searchParams.get('status') ?? '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const nextParams = applyPageToSearchParams(params, 1);
      const qs = nextParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setSchedule = useCallback(
    (value: string) => updateParam('schedule', value),
    [updateParam]
  );
  const setStatus = useCallback((value: string) => updateParam('status', value), [updateParam]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) {
      params.delete(key);
    }

    const nextParams = applyPageToSearchParams(params, 1);
    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const hasSelectFilters = Boolean(schedule || status);

  return {
    schedule,
    status,
    setSchedule,
    setStatus,
    clearFilters,
    hasSelectFilters,
  };
}
