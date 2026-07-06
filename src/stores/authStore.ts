'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Organization } from '@/types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  org: Organization | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
    org: Organization | null
  ) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setInitialized: () => void;
  logout: () => Promise<void>;
}

const CLEARED_STATE = {
  accessToken: null as string | null,
  refreshToken: null as string | null,
  user: null as User | null,
  org: null as Organization | null,
  isAuthenticated: false,
  isInitializing: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      ...CLEARED_STATE,
      isInitializing: true,
      setAuth: (accessToken, refreshToken, user, org) => {
        set({ accessToken, refreshToken, user, org, isAuthenticated: true, isInitializing: false });
      },
      setAccessToken: accessToken => {
        set({ accessToken });
      },
      setUser: user =>
        set({ user, org: user.organization, isAuthenticated: true, isInitializing: false }),
      clearAuth: () => {
        import('@/lib/queryClient')
          .then(({ queryClient }) => queryClient.clear())
          .catch(() => undefined);
        set(CLEARED_STATE);
      },
      setInitialized: () => {
        set({ isInitializing: false });
      },
      logout: async () => {
        try {
          const { authService } = await import('@/services/authService');
          await authService.logout();
        } catch {
          // ignore network errors during logout
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.setItem('vl_logout_signal', String(Date.now()));
          }
          const { queryClient } = await import('@/lib/queryClient');
          queryClient.clear();
          set(CLEARED_STATE);
        }
      },
    }),
    {
      name: 'securescan-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
