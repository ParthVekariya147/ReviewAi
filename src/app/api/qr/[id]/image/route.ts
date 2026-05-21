import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQRPng, generateQRSvg } from '@/lib/qr/generate';

type Params = Promise<{ id: string }>;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://reevo.io';

/* GET /api/qr/[id]/image?format=png|svg&color=%23000000&bg=%23FFFFFF&size=512
   Returns the QR image for a campaign. Auth required (owner only).             */
export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: code } = await supabase
    .from('qr_codes')
    .select('token, campaign_name, businesses!inner(owner_id)')
    .eq('id', id)
    .eq('businesses.owner_id', user.id)
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
