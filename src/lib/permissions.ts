export const Permission = {
  DOMAIN_VIEW: 'domain:view',
  DOMAIN_CREATE: 'domain:create',
  DOMAIN_DELETE: 'domain:delete',
  SCAN_VIEW: 'scan:view',
  SCAN_TRIGGER: 'scan:trigger',
  ALERT_VIEW: 'alert:view',
  ALERT_RESOLVE: 'alert:resolve',
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  USER_INVITE: 'user:invite',
  USER_MANAGE: 'user:manage',
  API_KEY_MANAGE: 'api_key:manage',
  REPORT_EXPORT: 'report:export',
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

const ROLE_PERMISSION_MAP: Record<string, PermissionKey[]> = {
  admin: [
    Permission.DOMAIN_VIEW,
    Permission.DOMAIN_CREATE,
    Permission.DOMAIN_DELETE,
    Permission.SCAN_VIEW,
    Permission.SCAN_TRIGGER,
    Permission.ALERT_VIEW,
    Permission.ALERT_RESOLVE,
    Permission.BILLING_VIEW,
    Permission.BILLING_MANAGE,
    Permission.USER_INVITE,
    Permission.USER_MANAGE,
    Permission.API_KEY_MANAGE,
    Permission.REPORT_EXPORT,
  ],
  member: [
    Permission.DOMAIN_VIEW,
    Permission.SCAN_VIEW,
    Permission.SCAN_TRIGGER,
    Permission.ALERT_VIEW,
    Permission.REPORT_EXPORT,
  ],
  viewer: [Permission.DOMAIN_VIEW, Permission.SCAN_VIEW, Permission.ALERT_VIEW],
  superadmin: Object.values(Permission) as PermissionKey[],
};

export function hasPermission(role: string | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  return ROLE_PERMISSION_MAP[role]?.includes(permission) ?? false;
}
