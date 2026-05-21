import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusinessId } from '@/lib/businesses/current';

/* GET /api/analytics/summary?days=30
   Calls the analytics_summary Postgres RPC — single round-trip,
   DB-side aggregation, uses composite indexes from 002 migration. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = Math.min(
    Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10)),
    365,
  );

  const { businessId, error: businessError } = await getCurrentBusinessId(db as Awaited<ReturnType<typeof createClient>>, user.id);

  if (businessError) {
    return NextResponse.json({ error: businessError.message, code: businessError.code }, { status: 500 });
  }

  if (!businessId) {
    return NextResponse.json({ error: 'No business found' }, { status: 404 });
  }

  const { data, error } = await db.rpc('analytics_summary', {
    p_business_id: businessId,
    p_days:        days,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
