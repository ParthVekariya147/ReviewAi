import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateTokenWithPrefix } from '@/lib/qr/tokens';

/* GET /api/qr — list all QR campaigns for the authenticated business owner */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const { data: codes, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes });
}

/* POST /api/qr — create a new QR campaign */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const campaignName: string = body?.campaign_name?.trim() ?? '';
  if (!campaignName) {
    return NextResponse.json({ error: 'campaign_name is required' }, { status: 400 });
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!business) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const token = generateTokenWithPrefix(campaignName);

  const { data: code, error } = await supabase
    .from('qr_codes')
    .insert({
      business_id:    business.id,
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
