'use client';

import { useAuthStore } from '@/stores/authStore';
import { hasPermission, requiresPlan } from '@/lib/roles';
import type { PermissionCode } from '@/lib/roles';
import type { PlanSlug } from '@/types';

export function useAuth() {
  const { user, org, isAuthenticated, accessToken, setAuth, logout } = useAuthStore();

  function can(permission: PermissionCode): boolean {
    if (!user) return false;
    if (!hasPermission(user.role, permission)) return false;
    if (org && org.plan && !requiresPlan(permission, org.plan as PlanSlug)) return false;
    return true;
  }

  return { user, org, isAuthenticated, accessToken, setAuth, logout, can };
}
