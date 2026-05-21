import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/* GET /api/businesses — get the authenticated user's business (or null) */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return NextResponse.json({ business: business ?? null });
}

/* POST /api/businesses — create (or upsert) the user's business */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const payload = {
    owner_id:              user.id,
    name:                  body.name.trim(),
    tagline:               body.tagline              ?? null,
    google_link:           body.google_link          ?? null,
    brand_color:           body.brand_color          ?? '#6E5BFF',
    logo_initials:         body.logo_initials        ?? body.name.slice(0, 2).toUpperCase(),
    min_rating_for_google: body.min_rating_for_google ?? 4,
    language:              body.language             ?? 'en',
  };

  const { data: business, error } = await supabase
    .from('businesses')
    .upsert(payload, { onConflict: 'owner_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business }, { status: 201 });
}

/* PATCH /api/businesses — update the user's business */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const allowed = ['name', 'tagline', 'google_link', 'brand_color', 'logo_initials',
                   'min_rating_for_google', 'language'] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ business });
}
