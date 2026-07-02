
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { tokenRefreshMutex } from '@/lib/tokenRefreshMutex';
import { env } from '@/lib/env';

function getCsrfToken(): string {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value ?? '');
  }
  return '';
}

export function isTimeoutError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  }
  return false;
}

export type ErrorBehavior =
  | 'inline_field_errors'
  | 'interceptor_refresh'
  | 'upgrade_modal'
  | 'inline_permission_error'
  | 'inline_conflict'
  | 'retry_after_toast'
  | 'degraded_banner'
  | 'default';

export function getErrorBehavior(status: number): ErrorBehavior {
  if (status === 400 || status === 422) return 'inline_field_errors';
  if (status === 401) return 'interceptor_refresh';
  if (status === 402) return 'upgrade_modal';
  if (status === 403) return 'inline_permission_error';
  if (status === 409) return 'inline_conflict';
  if (status === 429) return 'retry_after_toast';
  if (status >= 500) return 'degraded_banner';
  return 'default';
}

let isRedirecting = false;
let currentApiVersion: string | null = null;

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30_000,
});


apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  config.headers['X-Request-ID'] = crypto.randomUUID();

  const method = config.method?.toUpperCase();
  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    config.headers['Idempotency-Key'] = crypto.randomUUID();
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }

  return config;
});


apiClient.interceptors.response.use(
  response => {
    const apiVersion = response.headers['x-api-version'] as string | undefined;
    if (apiVersion) {
      if (currentApiVersion && currentApiVersion !== apiVersion) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('api:version-mismatch'));
        }
      }
      currentApiVersion = apiVersion;
    }
    return response;
  },
  async error => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 403) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('api:permission-denied', {
            detail: {
              url: originalRequest.url,
              message:
                (error.response.data as { error?: { message?: string } })?.error?.message ??
                'Permission denied.',
            },
          })
        );
      }
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    
    if (tokenRefreshMutex.isRefreshing) {
      return new Promise((resolve, reject) => {
        tokenRefreshMutex.subscribe(newToken => {
          if (!newToken) return reject(error);
          originalRequest._retry = true;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    tokenRefreshMutex.start();

    try {
      const storedRefreshToken = useAuthStore.getState().refreshToken;
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }
      const res = await axios.post<{ access: string; refresh?: string }>(
        `${env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh/`,
        { refresh: storedRefreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const newAccessToken = res.data.access;
      useAuthStore.getState().setAccessToken(newAccessToken);
      tokenRefreshMutex.resolve(newAccessToken);
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch {
      tokenRefreshMutex.reject();
      if (!isRedirecting) {
        isRedirecting = true;
        useAuthStore.getState().clearAuth();
        if (typeof window !== 'undefined') {
          const currentUrl = window.location.pathname + window.location.search;
          window.location.href = `/login?returnUrl=${encodeURIComponent(currentUrl)}`;
          setTimeout(() => {
            isRedirecting = false;
          }, 3000);
        }
      }
      return Promise.reject(error);
    }
  }
);

export default apiClient;
