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

  const rawDays = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10);
  const days = Math.min(Math.max(1, isNaN(rawDays) ? 30 : rawDays), 365);

  const { businessId, error: businessError } = await getCurrentBusinessId(db as Awaited<ReturnType<typeof createClient>>, user.id);

  if (businessError) {
    return NextResponse.json({ error: businessError.message, code: businessError.code }, { status: 500 });
  }

  if (!businessId) {
    return NextResponse.json({ error: 'No business found' }, { status: 404 });
  }

  const [{ data, error }, { data: draftRows }] = await Promise.all([
    db.rpc('analytics_summary', { p_business_id: businessId, p_days: days }),
    db
      .from('analytics_events')
      .select('meta')
      .eq('business_id', businessId)
      .eq('event_type', 'copy')
      .gte('created_at', new Date(Date.now() - days * 86400_000).toISOString()),
  ]);

  if (error) {
    console.error('[analytics/summary] RPC error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }

  /* Tally draft_index from copy event meta */
  let firstDraftCopied = 0;
  let secondDraftCopied = 0;
  for (const row of draftRows ?? []) {
    const idx = (row.meta as Record<string, unknown> | null)?.draft_index;
    if (idx === 0 || idx === '0') firstDraftCopied++;
    else if (idx === 1 || idx === '1') secondDraftCopied++;
    else firstDraftCopied++; // legacy events without draft_index count as first
  }

  return NextResponse.json(
    { ...data, draft_acceptance: { first: firstDraftCopied, second: secondDraftCopied } },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
  );
}
