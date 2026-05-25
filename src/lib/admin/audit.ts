import { createAdminClient } from '@/lib/supabase/admin';

export async function writeAuditLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const db = createAdminClient();

  const { error } = await db.from('audit_logs').insert({
    actor_id:    actorId,
    action,
    target_type: targetType,
    target_id:   targetId,
    meta:        meta ?? null,
  });

  if (error) {
    // Non-fatal — log to console but do not throw so the main action still succeeds
    console.error('[writeAuditLog]', action, error.message);
  }
}
