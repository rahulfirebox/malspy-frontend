'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { applyPageToSearchParams } from '@/lib/pagination';

export const SEARCH_DEBOUNCE_MS = 300;

export function useDebouncedUrlSearch(delay: number = SEARCH_DEBOUNCE_MS) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSearch = searchParams.get('q') ?? '';
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
      params.set('q', debouncedSearch);
    } else {
      params.delete('q');
    }

    const nextParams = applyPageToSearchParams(params, 1);
    const qs = nextParams.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedSearch, urlSearch, searchParams, router, pathname]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  return { search, setSearch, debouncedSearch };
}
