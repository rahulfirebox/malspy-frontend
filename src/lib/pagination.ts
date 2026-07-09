import type { PaginatedResponse } from '@/types';

export const DEFAULT_PAGE_SIZE = 10;

export interface PaginationQueryParams {
  page?: number;
  page_size: number;
  cursor?: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number | null;
  totalPages: number | null;
  startIndex: number;
  endIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/** Parse 1-based page number from URL/search param (UI label). */
export function parsePage(value: string | null | undefined, fallback = 1): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Build first-page API params. */
export function buildPaginationParams(
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginationQueryParams {
  return { page_size: pageSize };
}

/** Extract query params from API next/previous link (absolute or relative). */
export function extractQueryParamsFromPaginationLink(
  link: string | null | undefined
): URLSearchParams | null {
  if (!link) return null;

  try {
    const url = link.startsWith('http') ? new URL(link) : new URL(link, 'http://localhost');
    return url.searchParams;
  } catch {
    return null;
  }
}

/** Build list API params from current URL (cursor takes priority over page). */
export function buildListParamsFromSearchParams(
  searchParams: URLSearchParams,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginationQueryParams {
  const params: PaginationQueryParams = { page_size: pageSize };

  const cursor = searchParams.get('cursor');
  if (cursor) {
    params.cursor = cursor;
    return params;
  }

  const page = parsePage(searchParams.get('page'));
  if (page > 1) params.page = page;

  return params;
}

/** Apply API next/previous link to browser URL params. */
export function applyPaginationLinkToSearchParams(
  current: URLSearchParams,
  link: string | null | undefined,
  direction: 'next' | 'previous' | 'reset'
): URLSearchParams {
  const params = new URLSearchParams(current.toString());
  params.delete('cursor');
  params.delete('page');

  if (direction === 'reset' || !link) {
    return params;
  }

  const linkParams = extractQueryParamsFromPaginationLink(link);
  if (!linkParams) return params;

  for (const key of ['cursor', 'page', 'page_size'] as const) {
    const value = linkParams.get(key);
    if (value) params.set(key, value);
  }

  const currentPage = parsePage(current.get('page'));

  if (direction === 'next') {
    if (!params.get('page')) {
      params.set('page', String(currentPage + 1));
    }
  } else if (direction === 'previous') {
    const linkedPage = linkParams.get('page');
    if (linkedPage) {
      params.set('page', linkedPage);
    } else if (currentPage <= 2) {
      params.delete('page');
    } else {
      params.set('page', String(currentPage - 1));
    }

    if (!linkParams.get('cursor')) {
      params.delete('cursor');
    }
  }

  if (parsePage(params.get('page')) <= 1) {
    params.delete('page');
  }

  return params;
}

/** 1-based serial number for a table row (accounts for paginated lists). */
export function tableRowSerial(
  index: number,
  page = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): number {
  return (page - 1) * pageSize + index + 1;
}

/** Derive pagination metadata when total count is known. */
export function getPaginationMeta(
  totalCount: number,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalCount);

  return {
    page: safePage,
    pageSize,
    totalCount,
    totalPages,
    startIndex,
    endIndex,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
  };
}

/**
 * Build pagination meta from API keys: count, next, previous, page_size.
 * Navigation state always follows next/previous links from the API.
 */
export function getPaginationMetaFromResponse<T>(
  data: PaginatedResponse<T> | undefined,
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginationMeta {
  if (!data) {
    return {
      page,
      pageSize,
      totalCount: null,
      totalPages: null,
      startIndex: 0,
      endIndex: 0,
      hasPrevious: false,
      hasNext: false,
    };
  }

  const resolvedPageSize = data.page_size || pageSize;
  const resultsCount = data.results.length;
  const hasNext = Boolean(data.next);
  const hasPrevious = Boolean(data.previous);
  const startIndex = resultsCount === 0 ? 0 : (page - 1) * resolvedPageSize + 1;
  const endIndex = resultsCount === 0 ? 0 : startIndex + resultsCount - 1;

  if (typeof data.count === 'number') {
    const meta = getPaginationMeta(data.count, page, resolvedPageSize);
    return {
      ...meta,
      pageSize: resolvedPageSize,
      startIndex,
      endIndex,
      hasNext,
      hasPrevious,
    };
  }

  return {
    page,
    pageSize: resolvedPageSize,
    totalCount: null,
    totalPages: null,
    startIndex,
    endIndex,
    hasPrevious,
    hasNext,
  };
}

/** Reset pagination params (e.g. when search changes). */
export function applyPageToSearchParams(
  params: URLSearchParams,
  _page = 1
): URLSearchParams {
  return applyPaginationLinkToSearchParams(params, null, 'reset');
}
