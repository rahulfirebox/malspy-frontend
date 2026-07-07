'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { useAuthStore } from '@/stores/authStore';
import { useAuthHydration } from '@/hooks/useAuthHydration';
import { useApiHealth } from '@/hooks/useApiHealth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydration();
  const { isAuthenticated, isInitializing, logout } = useAuthStore();
  const router = useRouter();
  const { isHealthy } = useApiHealth();

  useEffect(() => {
    if (!hydrated || isInitializing) return;
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [hydrated, isAuthenticated, isInitializing, router]);

  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      const persist = useAuthStore.persist;
      if (persist && !persist.hasHydrated()) return;
      const { accessToken, refreshToken, isInitializing: bootstrapping } = useAuthStore.getState();
      if (e.persisted && !bootstrapping && !accessToken && !refreshToken) {
        window.location.replace('/login');
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'vl_logout_signal') void logout();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [logout]);

  if (!hydrated || isInitializing || !isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        {!isHealthy && (
          <div
            role="alert"
            className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800"
          >
            Service is temporarily unavailable. Some features may not work.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
