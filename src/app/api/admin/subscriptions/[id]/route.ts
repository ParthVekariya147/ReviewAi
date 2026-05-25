import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/admin/audit';
import { can } from '@/lib/admin/permissions';

const VALID_PLANS   = ['free', 'starter', 'pro', 'enterprise'] as const;
const VALID_STATUSES = ['active', 'canceled', 'past_due', 'trialing'] as const;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const { id } = await params;
  const db = createAdminClient();

  const { data: sub, error } = await db
    .from('subscriptions')
    .select(`
      id, business_id, plan, status, provider, provider_id,
      current_period_end, cancel_at_end, created_at, updated_at,
      businesses (id, name, owner_id),
      invoices (id, amount_cents, currency, status, provider_inv_id, pdf_url, created_at)
    `)
    .eq('id', id)
    .single();

  if (error || !sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const bizRaw = sub.businesses;
  const biz = (Array.isArray(bizRaw) ? bizRaw[0] : bizRaw) as { id: string; name: string; owner_id: string } | null;
  let ownerEmail = '';
  if (biz?.owner_id) {
    const { data: u } = await db.auth.admin.getUserById(biz.owner_id);
    ownerEmail = u?.user?.email ?? '';
  }

  return NextResponse.json({ ...sub, business_name: biz?.name ?? '', owner_email: ownerEmail });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;
  const { ctx } = result;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const db = createAdminClient();

  const updates: Record<string, unknown> = {};
  let action = '';

  if ('plan' in body) {
    if (!VALID_PLANS.includes(body.plan)) {
      return NextResponse.json({ error: `plan must be one of: ${VALID_PLANS.join(', ')}` }, { status: 400 });
    }
    if (!can(ctx.adminUser.role, 'subscription.change_plan')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    updates.plan = body.plan;
    action = 'subscription.plan_changed';
  }
  if ('status' in body) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }
    if (!can(ctx.adminUser.role, 'subscription.cancel')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    updates.status = body.status;
    action = 'subscription.status_changed';
  }
  if ('cancel_at_end' in body) {
    if (typeof body.cancel_at_end !== 'boolean') {
      return NextResponse.json({ error: 'cancel_at_end must be a boolean' }, { status: 400 });
    }
    if (!can(ctx.adminUser.role, 'subscription.cancel')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    updates.cancel_at_end = body.cancel_at_end;
    action = 'subscription.cancel_scheduled';
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  // Pre-fetch business_id before update to avoid a re-query after, and allow parallel writes
  let businessId: string | null = null;
  if ('plan' in body) {
    const { data: sub } = await db.from('subscriptions').select('business_id').eq('id', id).single();
    businessId = sub?.business_id ?? null;
  }

  const [{ error }] = await Promise.all([
    db.from('subscriptions').update(updates).eq('id', id),
    ('plan' in body && businessId)
      ? db.from('businesses').update({ plan: body.plan }).eq('id', businessId)
      : Promise.resolve({ error: null, data: null, count: null, status: 200, statusText: 'OK' }),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(ctx.user.id, action, 'subscription', id, { changes: updates, admin: ctx.user.email });
  return NextResponse.json({ ok: true });
}
