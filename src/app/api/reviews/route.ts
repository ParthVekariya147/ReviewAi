import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/reviews?page=1&per_page=25&status=all&days=30&search=
   Paginated review history for the authenticated business owner.
   Joins generated_reviews with qr_codes to get campaign names.  */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1',  10));
  const perPage  = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') ?? '25', 10)));
  const status   = searchParams.get('status') ?? 'all';
  const days     = searchParams.get('days');
  const search   = searchParams.get('search')?.trim() ?? '';

  const { data: biz } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!biz) {
    return NextResponse.json({ error: 'No business found' }, { status: 404 });
  }

  let query = supabase
    .from('generated_reviews')
    .select('id, qr_id, rating, ai_text, refreshes, copies, status, created_at, qr_codes(campaign_name)', { count: 'exact' })
    .eq('business_id', biz.id)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (days && days !== 'all') {
    const daysNum = parseInt(days, 10);
    if (!isNaN(daysNum)) {
      const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', since);
    }
  }

  if (search) {
    query = query.ilike('ai_text', `%${search}%`);
  }

  // Offset-based pagination (simple and correct for this scale)
  const from = (page - 1) * perPage;
  const to   = from + perPage - 1;
  query = query.range(from, to);

  const { data: reviews, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten qr_codes join into campaign_name field
  const flattened = (reviews ?? []).map(r => ({
    id:            r.id,
    qr_id:         r.qr_id,
    campaign_name: (r.qr_codes as unknown as { campaign_name: string } | null)?.campaign_name ?? '—',
    rating:        r.rating,
    ai_text:       r.ai_text,
    refreshes:     r.refreshes,
    copies:        r.copies,
    status:        r.status,
    created_at:    r.created_at,
  }));

  return NextResponse.json({
    reviews:  flattened,
    total:    count ?? 0,
    page,
    per_page: perPage,
  });
}
