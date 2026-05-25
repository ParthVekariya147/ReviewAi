import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserEmailsByIds } from '@/lib/admin/getUsersByIds';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireAdmin();
  if ('error' in result) return result.error;

  const { id } = await params;
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'));
  const PAGE_SIZE = 25;
  const offset = (page - 1) * PAGE_SIZE;

  const db = createAdminClient();
  const { data, count, error } = await db
    .from('audit_logs')
    .select('id, actor_id, action, target_type, target_id, meta, created_at', { count: 'exact' })
    .eq('target_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const actorIds = [...new Set((data ?? []).filter(l => l.actor_id).map(l => l.actor_id as string))];
  const emailMap = await getUserEmailsByIds(db, actorIds);

  const enriched = (data ?? []).map(l => ({
    ...l,
    actor_email: l.actor_id ? (emailMap[l.actor_id] ?? null) : null,
  }));

  return NextResponse.json({ data: enriched, total: count ?? 0, page, page_size: PAGE_SIZE });
}
