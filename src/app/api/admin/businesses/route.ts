import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserEmailsByIds } from '@/lib/admin/getUsersByIds';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const sp = request.nextUrl.searchParams;
  const page   = Math.max(1, parseInt(sp.get('page') ?? '1'));
  const rawSearch = sp.get('q') ?? '';
  if (rawSearch.length > 100) return NextResponse.json({ error: 'Search query too long' }, { status: 400 });
  const search = rawSearch;
  const plan   = sp.get('plan') ?? '';
  const status = sp.get('status') ?? '';
  const sortBy = sp.get('sort') ?? 'created_at';
  const dir    = sp.get('dir') === 'asc' ? true : false;  // true=asc, false=desc
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch businesses with owner emails via admin auth API
  let query = db
    .from('businesses')
    .select(`
      id, owner_id, name, tagline, google_link, brand_color, logo_initials,
      plan, suspended_at, suspended_reason, created_at, updated_at,
      subscriptions (id, plan, status, current_period_end, cancel_at_end)
    `, { count: 'exact' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  if (plan) {
    query = query.eq('plan', plan);
  }
  if (status === 'suspended') {
    query = query.not('suspended_at', 'is', null);
  }

  // Sort
  const sortable = ['name', 'plan', 'created_at'].includes(sortBy) ? sortBy : 'created_at';
  query = query.order(sortable, { ascending: dir });
  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: businesses, count, error } = await query;
  if (error) {
    console.error('[admin/businesses GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch QR counts, scan counts, and owner emails in parallel (migration 025 + 023)
  const bizIds  = (businesses ?? []).map(b => b.id);
  const ownerIds = [...new Set((businesses ?? []).map(b => b.owner_id))];

  const [
    { data: qrRows },
    { data: scanRows },
    emailMap,
  ] = await Promise.all([
    bizIds.length > 0
      ? db.rpc('admin_qr_counts_by_business', { business_ids: bizIds })
      : Promise.resolve({ data: [] }),
    bizIds.length > 0
      ? db.rpc('admin_scan_counts_by_business', { business_ids: bizIds })
      : Promise.resolve({ data: [] }),
    getUserEmailsByIds(db, ownerIds),
  ]);

  const qrCounts: Record<string, number> = {};
  (qrRows ?? []).forEach((r: { business_id: string; count: number }) => {
    qrCounts[r.business_id] = Number(r.count);
  });

  const scanCounts: Record<string, number> = {};
  (scanRows ?? []).forEach((r: { business_id: string; count: number }) => {
    scanCounts[r.business_id] = Number(r.count);
  });

  const rows = (businesses ?? []).map(b => ({
    ...b,
    owner_email:  emailMap[b.owner_id] ?? '',
    qr_count:     qrCounts[b.id] ?? 0,
    total_scans:  scanCounts[b.id] ?? 0,
    subscription: Array.isArray(b.subscriptions)
      ? (b.subscriptions[0] ?? null)
      : (b.subscriptions ?? null),
  }));

  return NextResponse.json({
    data: rows,
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
    has_more: (count ?? 0) > page * PAGE_SIZE,
  });
}
