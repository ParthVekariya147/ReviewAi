import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusinessId } from '@/lib/businesses/current';

type Params = Promise<{ id: string }>;

async function getAuthedQR(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, qrId: string) {
  const { businessId } = await getCurrentBusinessId(supabase, userId);
  if (!businessId) return null;

  const { data } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', qrId)
    .eq('business_id', businessId)
    .single();
  return data;
}

/* GET /api/qr/[id] — fetch a single QR campaign */
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const code = await getAuthedQR(db as Awaited<ReturnType<typeof createClient>>, user.id, id);
  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ code });
}

/* PATCH /api/qr/[id] — update campaign name, status, or toggles */
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await getAuthedQR(db as Awaited<ReturnType<typeof createClient>>, user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const VALID_STATUSES = new Set(['draft', 'live', 'paused', 'archived']);
  const updates: Record<string, unknown> = {};

  if ('campaign_name' in body) {
    const v = typeof body.campaign_name === 'string' ? body.campaign_name.trim().slice(0, 120) : undefined;
    if (v) updates.campaign_name = v;
  }
  if ('status' in body && VALID_STATUSES.has(String(body.status))) {
    updates.status = body.status;
  }
  if ('dynamic'        in body) updates.dynamic        = Boolean(body.dynamic);
  if ('ab_testing'     in body) updates.ab_testing     = Boolean(body.ab_testing);
  if ('pause_fallback' in body) updates.pause_fallback = Boolean(body.pause_fallback);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  // HIGH-3: scope update to both id and business_id to prevent TOCTOU
  const { businessId } = await getCurrentBusinessId(supabase, user.id);
  const { data: code, error } = await db
    .from('qr_codes')
    .update(updates)
    .eq('id', id)
    .eq('business_id', businessId!)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ code });
}

/* DELETE /api/qr/[id] — archive (soft delete) a campaign */
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await getAuthedQR(db as Awaited<ReturnType<typeof createClient>>, user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { businessId: bizId } = await getCurrentBusinessId(supabase, user.id);
  const { error } = await db
    .from('qr_codes')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('business_id', bizId!);

  if (error) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
