import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/admin/audit';
import { can } from '@/lib/admin/permissions';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;
  const { ctx } = result;

  const { id } = await params;
  const { status } = await request.json().catch(() => ({})) as { status?: string };

  if (!['paused', 'archived'].includes(status ?? '')) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const capability = status === 'paused' ? 'qr.pause' : 'qr.archive';
  if (!can(ctx.adminUser.role, capability)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const db = createAdminClient();
  const { error } = await db.from('qr_codes').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(ctx.user.id, `qr.${status}`, 'qr_code', id, { admin: ctx.user.email });
  return NextResponse.json({ ok: true });
}
