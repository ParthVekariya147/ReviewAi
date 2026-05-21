import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = Promise<{ id: string }>;

async function getAuthedQR(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, qrId: string) {
  const { data } = await supabase
    .from('qr_codes')
    .select('*, businesses!inner(owner_id)')
    .eq('id', qrId)
    .eq('businesses.owner_id', userId)
    .single();
  return data;
}

/* GET /api/qr/[id] — fetch a single QR campaign */
export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const code = await getAuthedQR(supabase, user.id, id);
  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ code });
}

/* PATCH /api/qr/[id] — update campaign name, status, or toggles */
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await getAuthedQR(supabase, user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const allowed = ['campaign_name', 'status', 'dynamic', 'ab_testing', 'pause_fallback'] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: code, error } = await supabase
    .from('qr_codes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code });
}

/* DELETE /api/qr/[id] — archive (soft delete) a campaign */
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await getAuthedQR(supabase, user.id, id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error } = await supabase
    .from('qr_codes')
    .update({ status: 'archived' })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
