'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { applyPageToSearchParams } from '@/lib/pagination';

export const SEARCH_DEBOUNCE_MS = 300;

interface DebouncedUrlSearchOptions {
  paramKey?: string;
  delay?: number;
}

export function useDebouncedUrlSearch(options?: DebouncedUrlSearchOptions) {
  const paramKey = options?.paramKey ?? 'q';
  const delay = options?.delay ?? SEARCH_DEBOUNCE_MS;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSearch = searchParams.get(paramKey) ?? '';
  const [search, setSearchState] = useState(urlSearch);
  const debouncedSearch = useDebounce(search, delay);

  useEffect(() => {
    setSearchState(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (debouncedSearch === urlSearch) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set(paramKey, debouncedSearch);
    } else {
      params.delete(paramKey);
    }

    const nextParams = applyPageToSearchParams(params, 1);
    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, urlSearch, searchParams, router, pathname, paramKey]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  return { search, setSearch, debouncedSearch };
}
