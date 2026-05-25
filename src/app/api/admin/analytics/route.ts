import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const sp = request.nextUrl.searchParams;
  let days = parseInt(sp.get('days') ?? '30');
  if (isNaN(days) || days < 1 || days > 365) days = 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const [
    { count: totalScans },
    { count: totalReviews },
    { count: copyCount },
    { count: genCount },
    { count: complCount },
    { data: countryRows },
    { data: deviceRows },
    { data: topBizRows },
    { data: draft1Data },
    { data: draft2Data },
  ] = await Promise.all([
    db.from('qr_scans').select('id', { count: 'exact', head: true }).gte('scanned_at', since),
    db.from('generated_reviews').select('id', { count: 'exact', head: true }).gte('created_at', since),
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'copy').gte('created_at', since),
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'generate').gte('created_at', since),
    db.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_type', 'complete').gte('created_at', since),
    // RPCs aggregate in DB — no full-table fetch into memory (migration 021)
    db.rpc('admin_count_by_country', { since_ts: since }),
    db.rpc('admin_count_by_device',  { since_ts: since }),
    db.rpc('admin_top_businesses_by_scans', { since_ts: since, top_n: 10 }),
    db.rpc('admin_count_draft_copies', { since_ts: since, draft_idx: 0 }),
    db.rpc('admin_count_draft_copies', { since_ts: since, draft_idx: 1 }),
  ]);

  const scanCount = totalScans ?? 0;
  const draft1Count = typeof draft1Data === 'number' ? draft1Data : 0;
  const draft2Count = typeof draft2Data === 'number' ? draft2Data : 0;

  const countries = (countryRows ?? []) as { country: string; count: number }[];
  const devices   = (deviceRows  ?? []) as { device:  string; count: number }[];

  const topBizEntries = (topBizRows ?? []) as { business_id: string; scans: number }[];
  const topBizIdList = topBizEntries.map(r => r.business_id);
  const { data: bizNameRows } = topBizIdList.length > 0
    ? await db.from('businesses').select('id, name').in('id', topBizIdList)
    : { data: [] };
  const bizNameMap: Record<string, string> = {};
  bizNameRows?.forEach(b => { bizNameMap[b.id] = b.name; });
  const topBusinesses = topBizEntries.map(r => ({
    id: r.business_id,
    name: bizNameMap[r.business_id] ?? r.business_id.slice(0, 8),
    scans: r.scans,
  }));

  const totalDrafts = (draft1Count + draft2Count) || 1;

  return NextResponse.json({
    kpis: {
      total_scans:          totalScans ?? 0,
      total_reviews:        totalReviews ?? 0,
      avg_copy_rate:        (genCount ?? 0) > 0 ? parseFloat((((copyCount ?? 0) / (genCount ?? 1)) * 100).toFixed(1)) : 0,
      avg_completion_rate:  scanCount > 0 ? parseFloat((((complCount ?? 0) / scanCount) * 100).toFixed(1)) : 0,
      draft1_rate:          parseFloat((draft1Count / totalDrafts * 100).toFixed(1)),
      draft2_rate:          parseFloat((draft2Count / totalDrafts * 100).toFixed(1)),
    },
    countries,
    devices,
    top_businesses: topBusinesses,
  });
}
