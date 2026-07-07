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
  sessionEpoch: number;
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
  sessionEpoch: 0,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...CLEARED_STATE,
      isInitializing: true,
      setAuth: (accessToken, refreshToken, user, org) => {
        set({
          accessToken,
          refreshToken,
          user,
          org,
          isAuthenticated: true,
          isInitializing: false,
          sessionEpoch: get().sessionEpoch + 1,
        });
      },
      setAccessToken: accessToken => {
        set({ accessToken });
      },
      setUser: user =>
        set({
          user,
          org: user.organization,
          isAuthenticated: true,
          isInitializing: false,
        }),
      clearAuth: () => {
        import('@/lib/queryClient')
          .then(({ queryClient }) => queryClient.clear())
          .catch(() => undefined);
        set({ ...CLEARED_STATE, sessionEpoch: get().sessionEpoch + 1 });
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
          set({ ...CLEARED_STATE, sessionEpoch: get().sessionEpoch + 1 });
        }
      },
    }),
    {
      name: 'securescan-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
      ),
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        org: state.org,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AuthState> | undefined;
        const hasTokens = Boolean(saved?.accessToken || saved?.refreshToken);
        return {
          ...current,
          ...saved,
          isAuthenticated: hasTokens || Boolean(saved?.user),
          isInitializing: hasTokens,
        };
      },
      onRehydrateStorage: () => state => {
        if (state && (state.accessToken || state.refreshToken)) {
          state.isAuthenticated = true;
          state.isInitializing = true;
        }
      },
    }
  )
);

function isSessionStale(startEpoch: number): boolean {
  return useAuthStore.getState().sessionEpoch !== startEpoch;
}

export function getAuthSessionEpoch(): number {
  return useAuthStore.getState().sessionEpoch;
}

export { isSessionStale };
