import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/admin/audit';
import { can } from '@/lib/admin/permissions';

export async function GET() {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();

  const [pricesRes, busRes] = await Promise.all([
    db.from('plan_prices').select('plan, amount_cents, currency, updated_at').order('amount_cents'),
    db.from('businesses').select('plan'),
  ]);

  if (pricesRes.error) return NextResponse.json({ error: pricesRes.error.message }, { status: 500 });

  // Count businesses per plan
  const counts: Record<string, number> = {};
  for (const b of busRes.data ?? []) {
    counts[b.plan] = (counts[b.plan] ?? 0) + 1;
  }

  const data = (pricesRes.data ?? []).map(p => ({
    ...p,
    business_count: counts[p.plan] ?? 0,
    mrr_cents: p.amount_cents * (counts[p.plan] ?? 0),
  }));

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;
  const { ctx } = result;

  if (!can(ctx.adminUser.role, 'plans.edit')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const VALID_PLANS = ['free', 'starter', 'pro', 'enterprise'];
  const { plan, amount_cents } = await request.json().catch(() => ({}));
  if (!plan || !VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: `plan must be one of: ${VALID_PLANS.join(', ')}` }, { status: 400 });
  }
  if (typeof amount_cents !== 'number' || !Number.isInteger(amount_cents) || amount_cents < 0) {
    return NextResponse.json({ error: 'amount_cents must be a non-negative integer' }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db
    .from('plan_prices')
    .update({ amount_cents, updated_at: new Date().toISOString() })
    .eq('plan', plan);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(ctx.user.id, 'plan.price_updated', 'plan', plan, { amount_cents, admin: ctx.user.email });
  return NextResponse.json({ ok: true });
}
