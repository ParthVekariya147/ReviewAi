import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusinessId } from '@/lib/businesses/current';
import { generateTokenWithPrefix } from '@/lib/qr/tokens';

/* GET /api/qr — list QR campaigns for the authenticated business owner */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: businessError } = await getCurrentBusinessId(db as Awaited<ReturnType<typeof createClient>>, user.id);

  if (businessError) return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 });
  if (!businessId) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  // BUG-13: paginate to prevent loading all rows into memory
  const sp      = req.nextUrl.searchParams;
  const page    = Math.max(1, parseInt(sp.get('page') ?? '1', 10));
  const perPage = Math.min(100, Math.max(1, parseInt(sp.get('per_page') ?? '50', 10)));
  const from    = (page - 1) * perPage;

  const { data: codes, error, count } = await db
    .from('qr_codes')
    .select('*', { count: 'exact' })
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .range(from, from + perPage - 1);

  if (error) return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 });
  return NextResponse.json({ codes, total: count ?? 0, page, per_page: perPage });
}

/* POST /api/qr — create a new QR campaign */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const campaignName: string = typeof body?.campaign_name === 'string'
    ? body.campaign_name.trim().slice(0, 120)
    : '';
  if (!campaignName) {
    return NextResponse.json({ error: 'campaign_name is required' }, { status: 400 });
  }

  const { businessId, error: businessError } = await getCurrentBusinessId(db as Awaited<ReturnType<typeof createClient>>, user.id);

  if (businessError) return NextResponse.json({ error: businessError.message, code: businessError.code }, { status: 500 });
  if (!businessId) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const token = generateTokenWithPrefix(campaignName);

  const { data: code, error } = await db
    .from('qr_codes')
    .insert({
      business_id:    businessId,
      token,
      campaign_name:  campaignName,
      status:         body?.status         ?? 'draft',
      dynamic:        body?.dynamic        ?? true,
      ab_testing:     body?.ab_testing     ?? false,
      pause_fallback: body?.pause_fallback ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ code }, { status: 201 });
}
