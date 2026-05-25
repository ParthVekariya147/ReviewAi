import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/security/rateLimit';
import type { AdminContext, AdminRole, AdminUser } from '@/types/admin';

export async function requireAdmin(
): Promise<{ ctx: AdminContext } | { error: NextResponse }> {
  // Rate-limit all admin routes: 60 req/min per IP
  const hdrs = await headers();
  const ip =
    hdrs.get('x-vercel-forwarded-for')?.split(',')[0].trim() ??
    hdrs.get('cf-connecting-ip') ??
    'unknown';
  const rl = await rateLimit(`admin:fn:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return {
      error: NextResponse.json({ error: 'Too many requests' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }),
    };
  }

  // If middleware already verified and forwarded admin identity, use it directly
  // (headers are stripped from client requests and only set by our middleware)
  const adminId        = hdrs.get('x-admin-id');
  const adminEmail     = hdrs.get('x-admin-email');
  const adminRole      = hdrs.get('x-admin-role') as AdminRole | null;
  const adminCreatedAt = hdrs.get('x-admin-created-at');

  if (adminId && adminEmail && adminRole && adminCreatedAt) {
    // Middleware already called getUser() (server-verified) + confirmed DB membership,
    // then stripped any client-supplied x-admin-* headers before setting these.
    // No further auth call needed — the headers are the proof.
    return {
      ctx: {
        user: { id: adminId, email: adminEmail },
        adminUser: { id: adminId, email: adminEmail, role: adminRole, created_at: adminCreatedAt },
      },
    };
  }

  // Fallback: verify against DB (direct invocation without middleware, e.g. tests)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const db = createAdminClient();
  const { data: adminUser, error: adminError } = await db
    .from('admin_users')
    .select('id, email, role, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (adminError || !adminUser) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    ctx: {
      user: { id: user.id, email: user.email ?? adminUser.email },
      adminUser: adminUser as AdminUser,
    },
  };
}

// Narrow helper — call inside route handler:
//   const result = await requireAdmin();
//   if ('error' in result) return result.error;
//   const { ctx } = result;
