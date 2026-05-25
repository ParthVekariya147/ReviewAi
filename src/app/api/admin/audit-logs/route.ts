import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserEmailsByIds } from '@/lib/admin/getUsersByIds';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const db = createAdminClient();
  const sp = request.nextUrl.searchParams;
  const page   = Math.max(1, parseInt(sp.get('page') ?? '1'));
  const limit  = Math.min(100, parseInt(sp.get('limit') ?? String(PAGE_SIZE)));
  const action = sp.get('action') ?? '';
  const since  = sp.get('since') ?? '';
  const offset = (page - 1) * limit;

  let query = db
    .from('audit_logs')
    .select('id, actor_id, action, target_type, target_id, meta, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (action) query = query.eq('action', action);
  if (since)  query = query.gte('created_at', since);
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const actorIds = [...new Set((data ?? []).filter(l => l.actor_id).map(l => l.actor_id as string))];
  const emailMap = await getUserEmailsByIds(db, actorIds);

  const enriched = (data ?? []).map(l => ({
    ...l,
    actor_email: l.actor_id ? (emailMap[l.actor_id] ?? null) : null,
  }));

  return NextResponse.json({ data: enriched, total: count ?? 0, page, page_size: PAGE_SIZE });
}
