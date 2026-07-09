'use client';

import { useAuthStore } from '@/stores/authStore';

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === 'undefined') return;

  const { pathname, search } = window.location;
  if (AUTH_PAGES.some(path => pathname.startsWith(path))) return;

  const nextReturnUrl = returnUrl ?? `${pathname}${search}`;
  const target =
    pathname === '/'
      ? '/login'
      : `/login?returnUrl=${encodeURIComponent(nextReturnUrl)}`;

  window.location.replace(target);
}

export function expireSession(): void {
  useAuthStore.getState().clearAuth();
  redirectToLogin();
}
