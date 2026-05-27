import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  const db = createAdminClient();
  const { data, error } = await db
    .from('plan_prices')
    .select('plan, amount_cents, currency, label, trial_days, review_limit, scan_limit, campaign_limit, is_popular')
    .order('amount_cents');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { plans: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } },
  );
}
