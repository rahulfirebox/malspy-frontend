'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { getAuthSessionEpoch, isSessionStale, useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import { expireSession } from '@/lib/authSession';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/results',
];

let bootstrapPromise: Promise<void> | null = null;

async function bootstrapSession(): Promise<void> {
  const startEpoch = getAuthSessionEpoch();
  const { setAccessToken, setUser, clearAuth, setInitialized } = useAuthStore.getState();
  const { accessToken, refreshToken, user: cachedUser } = useAuthStore.getState();

  if (!accessToken && !refreshToken) {
    setInitialized();
    return;
  }

  try {
    if (!accessToken && refreshToken) {
      const refreshed = await authService.refresh(refreshToken);
      if (isSessionStale(startEpoch)) return;

      setAccessToken(refreshed.access);
      if (refreshed.refresh) {
        useAuthStore.setState({ refreshToken: refreshed.refresh });
      }
    }

    if (isSessionStale(startEpoch)) return;

    const user = await authService.getMe();
    if (isSessionStale(startEpoch)) return;

    setUser(user);
  } catch (err) {
    if (isSessionStale(startEpoch)) return;

    const is401 = axios.isAxiosError(err) && err.response?.status === 401;
    if (is401) {
      expireSession();
      return;
    }

    // Network/server error — keep cached session if available
    if (cachedUser && (accessToken || refreshToken)) {
      useAuthStore.setState({
        user: cachedUser,
        org: cachedUser.organization,
        isAuthenticated: true,
        isInitializing: false,
      });
      return;
    }

    clearAuth();
  } finally {
    if (useAuthStore.getState().isInitializing && !isSessionStale(startEpoch)) {
      setInitialized();
    }
  }
}

function ensureBootstrap(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrapSession().finally(() => {
      bootstrapPromise = null;
    });
  }
  return bootstrapPromise;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydration();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isInitializing = useAuthStore(s => s.isInitializing);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) return;
    void ensureBootstrap();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || isInitializing) return;

    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/results'));
    if (!isAuthenticated && !isPublic && pathname.startsWith('/dashboard')) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, isAuthenticated, isInitializing, pathname, router]);

  return <>{children}</>;
}
