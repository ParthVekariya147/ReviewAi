import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentBusinessId } from '@/lib/businesses/current';
import { createAdminClient } from '@/lib/supabase/admin';

export type NotifPreferences = {
  new_5star:          boolean;
  low_ratings:        boolean;
  quota_alerts:       boolean;
  funnel_performance: boolean;
  team_activity:      boolean;
  billing_invoices:   boolean;
  product_updates:    boolean;
};

const DEFAULTS: NotifPreferences = {
  new_5star:          true,
  low_ratings:        true,
  quota_alerts:       true,
  funnel_performance: false,
  team_activity:      false,
  billing_invoices:   true,
  product_updates:    false,
};

export async function GET() {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizError } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );
  if (bizError || !businessId) return NextResponse.json({ preferences: DEFAULTS });

  const { data } = await db
    .from('notification_preferences')
    .select('new_5star, low_ratings, quota_alerts, funnel_performance, team_activity, billing_invoices, product_updates')
    .eq('business_id', businessId)
    .maybeSingle();

  return NextResponse.json({ preferences: data ?? DEFAULTS });
}

export async function DELETE() {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizError } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );
  if (bizError || !businessId) return NextResponse.json({ ok: true });

  const { error } = await db
    .from('notification_preferences')
    .delete()
    .eq('business_id', businessId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizError } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );
  if (bizError || !businessId) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const prefs: Partial<NotifPreferences> = {};

  for (const key of Object.keys(DEFAULTS) as (keyof NotifPreferences)[]) {
    if (key in body && typeof body[key] === 'boolean') {
      prefs[key] = body[key] as boolean;
    }
  }

  const { error } = await db
    .from('notification_preferences')
    .upsert({ business_id: businessId, ...prefs }, { onConflict: 'business_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
