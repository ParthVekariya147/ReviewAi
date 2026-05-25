import type { AdminRole } from '@/types/admin';

// What each role can do. Extend as needed.
const CAPABILITIES: Record<AdminRole, Set<string>> = {
  super_admin: new Set([
    'business.suspend',
    'business.unsuspend',
    'business.change_plan',
    'business.delete',
    'subscription.cancel',
    'subscription.change_plan',
    'qr.pause',
    'qr.archive',
    'audit.read',
    'admin_users.invite',
    'admin_users.remove',
    'admin_users.change_role',
    'analytics.read',
    'abuse.dismiss',
    'plans.edit',
  ]),
  admin: new Set([
    'business.suspend',
    'business.unsuspend',
    'business.change_plan',
    'subscription.cancel',
    'subscription.change_plan',
    'qr.pause',
    'qr.archive',
    'audit.read',
    'analytics.read',
    'abuse.dismiss',
  ]),
  support: new Set([
    'audit.read',
    'analytics.read',
  ]),
};

export function can(role: AdminRole, capability: string): boolean {
  return CAPABILITIES[role]?.has(capability) ?? false;
}
