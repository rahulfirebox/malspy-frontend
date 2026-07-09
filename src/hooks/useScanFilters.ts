'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { applyPageToSearchParams } from '@/lib/pagination';

const FILTER_KEYS = ['status', 'rating', 'malware', 'ordering', 'domain', 'q'] as const;

export function useScanFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status = searchParams.get('status') ?? '';
  const rating = searchParams.get('rating') ?? '';
  const malware = searchParams.get('malware') ?? '';
  const ordering = searchParams.get('ordering') ?? '';

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

  const setStatus = useCallback((value: string) => updateParam('status', value), [updateParam]);
  const setRating = useCallback((value: string) => updateParam('rating', value), [updateParam]);
  const setMalware = useCallback((value: string) => updateParam('malware', value), [updateParam]);
  const setOrdering = useCallback((value: string) => updateParam('ordering', value), [updateParam]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) {
      params.delete(key);
    }

    const nextParams = applyPageToSearchParams(params, 1);
    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const hasSelectFilters = Boolean(status || rating || malware || ordering);

  return {
    status,
    rating,
    malware,
    ordering,
    setStatus,
    setRating,
    setMalware,
    setOrdering,
    clearFilters,
    hasSelectFilters,
  };
}
