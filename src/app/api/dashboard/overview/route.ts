import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusiness } from '@/lib/businesses/current';

/* GET /api/dashboard/overview?days=30
   Single RPC call to Postgres — returns KPIs + deltas, daily chart
   series, campaign list with stats, and recent activity feed.
   Used by ScreenDashboard to replace all mock/generated data.    */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawDays = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10);
  const days = Math.min(Math.max(1, isNaN(rawDays) ? 30 : rawDays), 90);

  const { business: biz, error: businessError } = await getCurrentBusiness(db as Awaited<ReturnType<typeof createClient>>, user.id);

  if (businessError) {
    return NextResponse.json({ error: businessError.message, code: businessError.code }, { status: 500 });
  }

  if (!biz) {
    return NextResponse.json({ error: 'No business found' }, { status: 404 });
  }

  const { data, error } = await db.rpc('dashboard_overview', {
    p_business_id: biz.id,
    p_days:        days,
  });

  if (error) {
    console.error('[dashboard/overview] RPC error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }

  return NextResponse.json(
    { business: biz, ...data },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } },
  );
}
