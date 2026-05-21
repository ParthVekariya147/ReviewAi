import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/dashboard/overview?days=30
   Single RPC call to Postgres — returns KPIs + deltas, daily chart
   series, campaign list with stats, and recent activity feed.
   Used by ScreenDashboard to replace all mock/generated data.    */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = Math.min(
    Math.max(1, parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10)),
    90,
  );

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, plan, brand_color, logo_initials, google_link')
    .eq('owner_id', user.id)
    .single();

  if (!biz) {
    return NextResponse.json({ error: 'No business found' }, { status: 404 });
  }

  const { data, error } = await supabase.rpc('dashboard_overview', {
    p_business_id: biz.id,
    p_days:        days,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { business: biz, ...data },
    { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } },
  );
}
