import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const sp = request.nextUrl.searchParams;
  const page   = Math.max(1, parseInt(sp.get('page') ?? '1'));
  const status = sp.get('status') ?? '';
  const search = (sp.get('q') ?? '').toLowerCase();

  // Supabase PostgREST doesn't support ilike on embedded resource columns.
  // When searching by business name: fetch the full filtered set, apply name
  // filter in memory, then slice for the current page.
  const withSearch = search.length > 0;
  const offset = (page - 1) * PAGE_SIZE;

  let query = db
    .from('invoices')
    .select(`
      id, subscription_id, business_id, amount_cents, currency,
      status, provider_inv_id, pdf_url, created_at,
      businesses (name)
    `, withSearch ? undefined : { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (!withSearch) query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type BizJoin = { name: string };
  let rows = (data ?? []).map(inv => {
    const raw = inv.businesses;
    const biz = (Array.isArray(raw) ? raw[0] : raw) as BizJoin | null;
    return { ...inv, business_name: biz?.name ?? '', businesses: undefined };
  });

  if (withSearch) rows = rows.filter(r => r.business_name.toLowerCase().includes(search));

  const total    = withSearch ? rows.length : (count ?? 0);
  const pageRows = withSearch ? rows.slice(offset, offset + PAGE_SIZE) : rows;

  // Summary: use count-only queries to avoid 1000-row truncation
  const [{ count: openCount }, { count: paidCount }, { data: revenueData }] = await Promise.all([
    db.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    db.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    db.from('invoices').select('amount_cents.sum()').eq('status', 'paid').single(),
  ]);
  const totalRevenue = ((revenueData as Record<string, number> | null)?.sum) ?? 0;

  return NextResponse.json({
    data: pageRows,
    total,
    page,
    page_size: PAGE_SIZE,
    has_more: total > page * PAGE_SIZE,
    summary: { total_revenue: totalRevenue, open_count: openCount ?? 0, paid_count: paidCount ?? 0 },
  });
}
