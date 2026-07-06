'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/results',
];

async function bootstrapSession(): Promise<void> {
  const { accessToken, refreshToken, setAccessToken, setUser, clearAuth, setInitialized } =
    useAuthStore.getState();

  if (!accessToken && !refreshToken) {
    setInitialized();
    return;
  }

  try {
    let token = accessToken;
    if (!token && refreshToken) {
      const refreshed = await authService.refresh(refreshToken);
      token = refreshed.access;
      setAccessToken(token);
    }

    const user = await authService.getMe();
    setUser(user);
  } catch {
    clearAuth();
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isInitializing = useAuthStore(s => s.isInitializing);
  const router = useRouter();
  const pathname = usePathname();
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    if (bootstrapStarted.current) return;

    const runBootstrap = () => {
      if (bootstrapStarted.current) return;
      bootstrapStarted.current = true;
      void bootstrapSession();
    };

    if (useAuthStore.persist.hasHydrated()) {
      runBootstrap();
      return;
    }

    return useAuthStore.persist.onFinishHydration(runBootstrap);
  }, []);

  useEffect(() => {
    if (isInitializing) return;

    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/results'));
    if (!isAuthenticated && !isPublic && pathname.startsWith('/dashboard')) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isInitializing, pathname, router]);

  return <>{children}</>;
}
