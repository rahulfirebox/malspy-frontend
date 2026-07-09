'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { applyPageToSearchParams } from '@/lib/pagination';
import { DEFAULT_ALERT_STATUS } from '@/lib/constants/alertFilters';

const FILTER_KEYS = ['severity', 'status', 'type', 'date', 'domain'] as const;

export function useAlertFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const severity = searchParams.get('severity') ?? '';
  const status = searchParams.get('status') ?? DEFAULT_ALERT_STATUS;
  const type = searchParams.get('type') ?? '';
  const date = searchParams.get('date') ?? '';

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

  const setSeverity = useCallback((value: string) => updateParam('severity', value), [updateParam]);
  const setStatus = useCallback(
    (value: string) => updateParam('status', value === DEFAULT_ALERT_STATUS ? '' : value),
    [updateParam]
  );
  const setType = useCallback((value: string) => updateParam('type', value), [updateParam]);
  const setDate = useCallback((value: string) => updateParam('date', value), [updateParam]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) {
      params.delete(key);
    }

    const nextParams = applyPageToSearchParams(params, 1);
    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const hasActiveFilters = Boolean(
    severity || type || date || searchParams.get('domain') || status !== DEFAULT_ALERT_STATUS
  );

  return {
    severity,
    status,
    type,
    date,
    setSeverity,
    setStatus,
    setType,
    setDate,
    clearFilters,
    hasActiveFilters,
  };
}

export function buildAlertListParams(filters: {
  severity: string;
  status: string;
  type: string;
  date?: string;
  domain?: string;
}): {
  severity?: string;
  status?: string;
  type?: string;
  date?: string;
  domain?: string;
} {
  const params: {
    severity?: string;
    status?: string;
    type?: string;
    date?: string;
    domain?: string;
  } = {};

  if (filters.severity) params.severity = filters.severity;
  if (filters.type) params.type = filters.type;
  if (filters.date) params.date = filters.date;
  if (filters.domain) params.domain = filters.domain;

  params.status = filters.status === 'resolved' ? 'resolved' : 'open';

  return params;
}
