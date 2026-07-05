import axios from 'axios';
import type { PaginatedResponse } from '@/types';
import type { AxiosResponse } from 'axios';

export interface ParsedApiError {
  code: string;
  message: string;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: { code?: string; message?: string } }
      | undefined;
    const code = data?.error?.code ?? 'UNKNOWN_ERROR';
    const message = data?.error?.message ?? 'An unexpected error occurred. Please try again.';
    return { code, message };
  }
  if (error instanceof Error) {
    return { code: 'CLIENT_ERROR', message: error.message };
  }
  return { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred. Please try again.' };
}

type ApiEnvelope<T> = { success?: boolean; data?: T };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function unwrapApiData<T>(body: unknown): T {
  if (isRecord(body) && 'data' in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}

function extractResultItems<T>(payload: Record<string, unknown>): T[] {
  for (const key of ['results', 'items', 'domains'] as const) {
    const value = payload[key];
    if (Array.isArray(value)) return value as T[];
  }
  return [];
}

export function parsePaginatedResponse<T>(
  response: AxiosResponse<PaginatedResponse<T> | ApiEnvelope<PaginatedResponse<T> | T[]>>
): PaginatedResponse<T> {
  const unwrapped = unwrapApiData<PaginatedResponse<T> | T[] | Record<string, unknown>>(
    response.data
  );

  if (Array.isArray(unwrapped)) {
    return {
      results: unwrapped,
      count: unwrapped.length,
      next: null,
      previous: null,
      page_size: unwrapped.length,
    };
  }

  if (isRecord(unwrapped)) {
    const results = extractResultItems<T>(unwrapped);
    const count =
      typeof unwrapped.count === 'number' ? unwrapped.count : results.length;

    return {
      results,
      count,
      next: typeof unwrapped.next === 'string' ? unwrapped.next : null,
      previous: typeof unwrapped.previous === 'string' ? unwrapped.previous : null,
      page_size:
        typeof unwrapped.page_size === 'number' ? unwrapped.page_size : results.length,
    };
  }

  return { results: [], count: 0, next: null, previous: null, page_size: 0 };
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
