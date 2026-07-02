'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

function buildReturnUrl(pathname: string): string {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return '/dashboard';
  return pathname;
}

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isInitializing = useAuthStore(s => s.isInitializing);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      const returnUrl = buildReturnUrl(pathname);
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, isInitializing, router, pathname]);

  if (isInitializing) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
