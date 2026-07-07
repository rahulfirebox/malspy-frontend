'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  applyPaginationLinkToSearchParams,
  buildListParamsFromSearchParams,
  DEFAULT_PAGE_SIZE,
  getPaginationMetaFromResponse,
  parsePage,
} from '@/lib/pagination';
import type { PaginatedResponse } from '@/types';

export function useUrlPagination(pageSize: number = DEFAULT_PAGE_SIZE) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = parsePage(searchParams.get('page'));
  const cursor = searchParams.get('cursor');
  const apiParams = buildListParamsFromSearchParams(searchParams, pageSize);

  const navigateWithLink = useCallback(
    (link: string | null | undefined, direction: 'next' | 'previous' | 'reset') => {
      const params = applyPaginationLinkToSearchParams(searchParams, link, direction);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const goNext = useCallback(
    (nextLink: string | null | undefined) => navigateWithLink(nextLink, 'next'),
    [navigateWithLink]
  );

  const goPrevious = useCallback(
    (previousLink: string | null | undefined) => navigateWithLink(previousLink, 'previous'),
    [navigateWithLink]
  );

  const resetPagination = useCallback(
    () => navigateWithLink(null, 'reset'),
    [navigateWithLink]
  );

  const getMeta = useCallback(
    <T,>(data: PaginatedResponse<T> | undefined) =>
      getPaginationMetaFromResponse(data, page, pageSize),
    [page, pageSize]
  );

  return {
    page,
    pageSize,
    cursor,
    apiParams,
    goNext,
    goPrevious,
    resetPagination,
    getMeta,
  };
}
