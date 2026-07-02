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

export function parsePaginatedResponse<T>(
  response: AxiosResponse<PaginatedResponse<T>>
): PaginatedResponse<T> {
  const { results, count, next, previous, page_size } = response.data;
  return { results, count, next, previous, page_size };
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
