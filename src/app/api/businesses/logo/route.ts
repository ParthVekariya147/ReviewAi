import { NextRequest, NextResponse } from 'next/server';
import { createClient }      from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusinessId } from '@/lib/businesses/current';
import sharp from 'sharp';

const BUCKET       = 'business-logos';
const MAX_BYTES    = 2 * 1024 * 1024;  // 2 MB raw upload limit
const OUTPUT_SIZE  = 512;              // normalize all logos to 512×512 PNG before storage
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);

/* POST /api/businesses/logo
   Multipart form field: `logo` (File)
   Uploads to Supabase Storage, updates businesses.logo_url              */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const db       = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizErr } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );
  if (bizErr)      return NextResponse.json({ error: bizErr.message }, { status: 500 });
  if (!businessId) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  /* ── Parse multipart ── */
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('logo');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'logo field is required (File)' }, { status: 400 });
  }

  /* ── Validate MIME (content-type header from client + magic bytes via sharp) ── */
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use PNG, JPG, or WebP.' },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large. Maximum is 2 MB.' }, { status: 413 });
  }

  /* ── Read file bytes ── */
  const rawBuf = Buffer.from(await file.arrayBuffer());

  /* ── Validate actual image data and normalize to 512×512 PNG via sharp ── */
  let normalizedBuf: Buffer;
  try {
    const meta = await sharp(rawBuf).metadata();
    if (!meta.width || !meta.height) throw new Error('Invalid image');

    normalizedBuf = await sharp(rawBuf)
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 8 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      { error: 'Could not process image. Ensure it is a valid PNG, JPG, or WebP file.' },
      { status: 422 },
    );
  }

  /* ── Upload to Supabase Storage ── */
  const storagePath = `${businessId}/logo.png`;

  const { error: uploadErr } = await db.storage
    .from(BUCKET)
    .upload(storagePath, normalizedBuf, {
      contentType: 'image/png',
      upsert:      true,    // overwrite if logo already exists
    });

  if (uploadErr) {
    console.error('[logo/upload] storage error:', uploadErr);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }

  /* ── Get public URL ── */
  const { data: urlData } = db.storage.from(BUCKET).getPublicUrl(storagePath);
  // Append cache-buster so browsers re-fetch after update
  const logoUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  /* ── Persist URL to businesses row ── */
  const { error: updateErr } = await db
    .from('businesses')
    .update({ logo_url: urlData.publicUrl })   // store without cache-buster in DB
    .eq('id', businessId);

  if (updateErr) {
    console.error('[logo/upload] db update error:', updateErr);
    return NextResponse.json({ error: 'Failed to save logo URL.' }, { status: 500 });
  }

  return NextResponse.json({ logo_url: logoUrl }, { status: 200 });
}

/* PATCH /api/businesses/logo — save an external URL directly (skips Storage) */
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const db       = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizErr } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );
  if (bizErr)      return NextResponse.json({ error: bizErr.message }, { status: 500 });
  if (!businessId) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const body = await req.json().catch(() => null);
  const url  = typeof body?.url === 'string' ? body.url.trim() : '';
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return NextResponse.json({ error: 'URL must start with https://' }, { status: 400 });
  }
  // Limit URL length to prevent abuse
  if (url.length > 2048) {
    return NextResponse.json({ error: 'URL too long' }, { status: 400 });
  }

  const { error: updateErr } = await db
    .from('businesses')
    .update({ logo_url: url })
    .eq('id', businessId);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to save logo URL.' }, { status: 500 });
  }

  return NextResponse.json({ logo_url: url });
}

/* DELETE /api/businesses/logo — removes logo from storage + clears logo_url */
export async function DELETE() {
  const supabase = await createClient();
  const db       = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId, error: bizErr } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );
  if (bizErr)      return NextResponse.json({ error: bizErr.message }, { status: 500 });
  if (!businessId) return NextResponse.json({ error: 'No business found' }, { status: 404 });

  const storagePath = `${businessId}/logo.png`;

  // Remove from storage (ignore "not found" — DELETE is idempotent)
  await db.storage.from(BUCKET).remove([storagePath]);

  const { error: updateErr } = await db
    .from('businesses')
    .update({ logo_url: null })
    .eq('id', businessId);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to clear logo.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
