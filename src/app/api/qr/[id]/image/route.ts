import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusinessId } from '@/lib/businesses/current';
import { generateQRPng, generateQRSvg } from '@/lib/qr/generate';
import { rateLimit, getClientIp } from '@/lib/security/rateLimit';

type Params = Promise<{ id: string }>;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reevo.io';

/* GET /api/qr/[id]/image?format=png|svg&color=%23000000&bg=%23FFFFFF&size=512
   Returns the QR image for a campaign. Auth required (owner only).             */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  /* Rate limit: 30 image downloads / minute per IP */
  const ip = getClientIp(req);
  const rl = rateLimit(`qr-image:${ip}`, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
    });
  }

  const { id } = await params;
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: businessError } = await getCurrentBusinessId(db as Awaited<ReturnType<typeof createClient>>, user.id);
  if (businessError) {
    return NextResponse.json({ error: businessError.message, code: businessError.code }, { status: 500 });
  }
  if (!businessId) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const { data: code } = await db
    .from('qr_codes')
    .select('token, campaign_name')
    .eq('id', id)
    .eq('business_id', businessId)
    .single();

  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const sp     = req.nextUrl.searchParams;
  const format = sp.get('format') === 'svg' ? 'svg' : 'png';
  const color  = sp.get('color')  ?? '#000000';
  const bg     = sp.get('bg')     ?? '#FFFFFF';
  const size   = parseInt(sp.get('size') ?? '512', 10);

  const qrUrl  = `${BASE_URL}/r/${code.token}`;

  if (format === 'svg') {
    const svg = await generateQRSvg(qrUrl, { color, bg });
    return new NextResponse(svg, {
      headers: {
        'Content-Type':        'image/svg+xml',
        'Content-Disposition': `attachment; filename="${code.campaign_name}-qr.svg"`,
        'Cache-Control':       'no-store',
      },
    });
  }

  const png = await generateQRPng(qrUrl, { color, bg, size });
  return new NextResponse(png as unknown as BodyInit, {
    headers: {
      'Content-Type':        'image/png',
      'Content-Disposition': `attachment; filename="${code.campaign_name}-qr.png"`,
      'Cache-Control':       'no-store',
    },
  });
}
