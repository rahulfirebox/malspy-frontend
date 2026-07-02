import type { UserRole, PlanSlug } from '@/types';



export const PERMISSIONS = {
  'scan.create': ['owner', 'admin', 'member', 'superadmin'],
  'scan.read_all': ['owner', 'admin', 'member', 'viewer', 'superadmin'],
  'scan.read': ['owner', 'admin', 'member', 'viewer', 'superadmin'],
  'scan.delete': ['owner', 'admin', 'superadmin'],
  'scan.export': ['owner', 'admin', 'member', 'superadmin'],
  'domains.read_all': ['owner', 'admin', 'member', 'viewer', 'superadmin'],
  'domains.create': ['owner', 'admin', 'superadmin'],
  'domains.update': ['owner', 'admin', 'superadmin'],
  'domains.delete': ['owner', 'admin', 'superadmin'],
  'alerts.read_all': ['owner', 'admin', 'member', 'viewer', 'superadmin'],
  'alerts.update': ['owner', 'admin', 'member', 'superadmin'],
  'org.read': ['owner', 'admin', 'superadmin'],
  'members.read_all': ['owner', 'admin', 'superadmin'],
  'members.invite': ['owner', 'admin', 'superadmin'],
  'members.delete': ['owner', 'admin', 'superadmin'],
  'billing.read': ['owner', 'admin', 'superadmin'],
  'billing.write': ['owner', 'superadmin'],
  'api_keys.read': ['owner', 'admin', 'superadmin'],
  'api_keys.create': ['owner', 'admin', 'superadmin'],
  'api_keys.delete': ['owner', 'admin', 'superadmin'],
  'agents.read_all': ['owner', 'admin', 'superadmin'],
  'agents.create': ['owner', 'admin', 'superadmin'],
  'agents.delete': ['owner', 'admin', 'superadmin'],
} as const;

export type PermissionCode = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: PermissionCode): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export function requiresPlan(permission: PermissionCode, plan: PlanSlug): boolean {
  const planGated: Partial<Record<PermissionCode, PlanSlug[]>> = {
    'scan.export': ['pro', 'enterprise'],
    'domains.create': ['pro', 'enterprise'],
    'domains.update': ['pro', 'enterprise'],
    'domains.delete': ['pro', 'enterprise'],
    'api_keys.read': ['enterprise'],
    'api_keys.create': ['enterprise'],
    'api_keys.delete': ['enterprise'],
    'agents.read_all': ['pro', 'enterprise'],
    'agents.create': ['pro', 'enterprise'],
    'agents.delete': ['pro', 'enterprise'],
  };
  const required = planGated[permission];
  if (!required) return true;
  return required.includes(plan);
}
