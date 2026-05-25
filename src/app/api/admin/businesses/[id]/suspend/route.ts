import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/admin/audit';
import { can } from '@/lib/admin/permissions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;
  const { ctx } = result;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { suspend, reason } = body;

  if (typeof suspend !== 'boolean') {
    return NextResponse.json({ error: 'suspend must be a boolean' }, { status: 400 });
  }
  const capability = suspend ? 'business.suspend' : 'business.unsuspend';
  if (!can(ctx.adminUser.role, capability)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  const safeReason = reason ? String(reason).slice(0, 500) : null;

  const db = createAdminClient();
  const { error } = await db.from('businesses').update({
    suspended_at:     suspend ? new Date().toISOString() : null,
    suspended_reason: suspend ? safeReason : null,
  }).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(
    ctx.user.id,
    suspend ? 'business.suspended' : 'business.unsuspended',
    'business',
    id,
    { reason: safeReason, admin: ctx.user.email },
  );

  return NextResponse.json({ ok: true });
}
