import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { writeAuditLog } from '@/lib/admin/audit';
import { can } from '@/lib/admin/permissions';
import { env } from '@/lib/env';

export async function GET() {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const { data, error } = await db.from('admin_users').select('id, email, role, created_at').order('created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data ?? [] });
}

export async function POST(request: NextRequest) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;
  const { ctx } = result;

  if (!can(ctx.adminUser.role, 'admin_users.invite')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { email, role = 'admin' } = await request.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const db = createAdminClient();

  // Look up the user by email via the Auth REST API with an email filter.
  // DO NOT use db.auth.admin.listUsers() here — it loads the entire user
  // table into memory and will OOM-crash the serverless function at scale.
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey  = env.SUPABASE_SERVICE_ROLE;
  const authRes = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
    },
  );
  if (!authRes.ok) {
    const body = await authRes.json().catch(() => ({})) as { message?: string };
    return NextResponse.json({ error: body.message ?? 'Auth lookup failed' }, { status: 500 });
  }
  const { users: matchedUsers } = await authRes.json() as { users: { id: string; email?: string }[] };
  const authUser = matchedUsers?.[0] ?? null;

  if (!authUser) {
    return NextResponse.json({ error: 'No Supabase user found with that email. They must sign up first.' }, { status: 404 });
  }

  const { error: insertError } = await db.from('admin_users').insert({
    id: authUser.id, email, role,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await writeAuditLog(ctx.user.id, 'admin_user.invited', 'admin_user', authUser.id, { email, role, by: ctx.user.email });
  return NextResponse.json({ ok: true });
}
