'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/apiClient';
import type { User } from '@/types';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/results',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken, setUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const didMount = useRef(false);

  
  
  
  
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;

    if (accessToken) {
      const controller = new AbortController();
      apiClient
        .get<{ success: boolean; data: User }>('/auth/me/', { signal: controller.signal })
        .then(res => {
          setUser(res.data.data);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          useAuthStore.getState().clearAuth();
        });
      return () => controller.abort();
    } else {
      useAuthStore.getState().setInitialized();
    }
  }, []); 

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/results'));
    if (!isAuthenticated && !isPublic && pathname.startsWith('/dashboard')) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}
