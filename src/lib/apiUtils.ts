import axios from 'axios';
import type { PaginatedResponse, User } from '@/types';
import type { AxiosResponse } from 'axios';

export interface ParsedApiError {
  code: string;
  message: string;
  scanId?: string;
}

function readScanIdFromErrorBody(errorBody: unknown): string | undefined {
  if (!isRecord(errorBody)) return undefined;

  for (const key of ['scan_id', 'existing_scan_id', 'id'] as const) {
    if (typeof errorBody[key] === 'string') return errorBody[key];
  }

  if (isRecord(errorBody.details)) {
    for (const key of ['scan_id', 'existing_scan_id', 'id'] as const) {
      if (typeof errorBody.details[key] === 'string') return errorBody.details[key];
    }
  }

  return undefined;
}

function readFirstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = readFirstString(item);
      if (nested) return nested;
    }
  }

  return undefined;
}

function extractFieldErrors(errors: unknown): string | undefined {
  if (!isRecord(errors)) return undefined;

  for (const value of Object.values(errors)) {
    const fieldMessage = readFirstString(value);
    if (fieldMessage) return fieldMessage;
  }

  return undefined;
}

function extractErrorMessage(data: unknown): string | undefined {
  if (!isRecord(data)) return undefined;

  const topLevelMessage = readFirstString(data.message);
  if (topLevelMessage) return topLevelMessage;

  const detail = readFirstString(data.detail);
  if (detail) return detail;

  if (isRecord(data.error)) {
    const fieldErrors =
      extractFieldErrors(data.error.errors) ?? extractFieldErrors(data.error.details);
    if (fieldErrors) return fieldErrors;

    const nestedMessage =
      readFirstString(data.error.message) ??
      readFirstString(data.error.detail) ??
      readFirstString(data.error.error);
    if (nestedMessage) return nestedMessage;

    for (const [key, value] of Object.entries(data.error)) {
      if (['code', 'error_code', 'details', 'errors', 'message', 'detail'].includes(key)) continue;
      const fieldMessage = readFirstString(value);
      if (fieldMessage) return fieldMessage;
    }
  }

  const topLevelFieldErrors = extractFieldErrors(data.errors);
  if (topLevelFieldErrors) return topLevelFieldErrors;

  const errorString = readFirstString(data.error);
  if (errorString) return errorString;

  for (const [key, value] of Object.entries(data)) {
    if (['statusCode', 'success', 'data', 'error', 'errors'].includes(key)) continue;
    const fieldMessage = readFirstString(value);
    if (fieldMessage) return fieldMessage;
  }

  return undefined;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    const errBody = isRecord(data) && isRecord(data.error) ? data.error : undefined;
    const code =
      (typeof errBody?.code === 'string' && errBody.code) ||
      (typeof errBody?.error_code === 'string' && errBody.error_code) ||
      (isRecord(data) && typeof data.code === 'string' && data.code) ||
      'UNKNOWN_ERROR';
    const message =
      extractErrorMessage(data) ||
      'An unexpected error occurred. Please try again.';
    const scanId = readScanIdFromErrorBody(errBody);
    return { code, message, scanId };
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

export function normalizeAuthTokens(payload: unknown): { access: string; refresh: string } {
  const data = unwrapApiData<Record<string, unknown>>(payload);

  const readPair = (source: Record<string, unknown>) => {
    const access =
      (typeof source.access === 'string' && source.access) ||
      (typeof source.access_token === 'string' && source.access_token) ||
      null;
    const refresh =
      (typeof source.refresh === 'string' && source.refresh) ||
      (typeof source.refresh_token === 'string' && source.refresh_token) ||
      '';

    if (access) return { access, refresh };
    return null;
  };

  const direct = readPair(data);
  if (direct) return direct;

  if (isRecord(data.tokens)) {
    const nested = readPair(data.tokens);
    if (nested) return nested;
  }

  throw new Error('Invalid auth response: missing access token');
}

export function extractUserFromAuthPayload(payload: unknown): User | null {
  const data = unwrapApiData<Record<string, unknown>>(payload);
  if (isRecord(data.user) && typeof data.user.email === 'string') {
    return data.user as User;
  }
  if (typeof data.id === 'string' && typeof data.email === 'string') {
    return data as unknown as User;
  }
  return null;
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
    const count = typeof unwrapped.count === 'number' ? unwrapped.count : null;

    return {
      results,
      count,
      next: typeof unwrapped.next === 'string' ? unwrapped.next : null,
      previous: typeof unwrapped.previous === 'string' ? unwrapped.previous : null,
      page_size:
        typeof unwrapped.page_size === 'number' ? unwrapped.page_size : results.length,
    };
  }

  return { results: [], count: null, next: null, previous: null, page_size: 0 };
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

export type DomainProtocol = 'http' | 'https';

export function hasUrlProtocol(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** Prepend protocol when the user entered a bare domain; leave full URLs unchanged. */
export function normalizeDomainUrlInput(raw: string, protocol: DomainProtocol): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  if (hasUrlProtocol(trimmed)) {
    return trimmed;
  }

  const host = trimmed.replace(/^\/+/, '');
  return `${protocol}://${host}`;
}
