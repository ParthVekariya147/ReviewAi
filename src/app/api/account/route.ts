import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusinessId } from '@/lib/businesses/current';
import { env } from '@/lib/env';

/**
 * DELETE /api/account
 *
 * Hard-deletes the authenticated user and all associated business data.
 * Cascade order:
 *   1. notification_preferences
 *   2. subscriptions
 *   3. qr_codes / funnel_events (handled via ON DELETE CASCADE in DB)
 *   4. businesses row (triggers remaining cascades)
 *   5. Supabase auth user
 */
export async function DELETE() {
  const supabase = await createClient();
  const db = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { businessId } = await getCurrentBusinessId(
    db as Awaited<ReturnType<typeof createClient>>,
    user.id,
  );

  if (businessId) {
    // 1. notification preferences
    await db.from('notification_preferences').delete().eq('business_id', businessId);

    // 2. subscriptions
    await db.from('subscriptions').delete().eq('business_id', businessId);

    // 3. business row (cascades qr_codes, funnel_events, etc.)
    await db.from('businesses').delete().eq('id', businessId);
  }

  // 4. Delete the Supabase auth user via service-role Admin API
  const deleteRes = await fetch(
    `${env.SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
        apikey: env.SUPABASE_SERVICE_ROLE,
      },
    },
  );

  if (!deleteRes.ok) {
    const body = await deleteRes.json().catch(() => ({})) as { message?: string };
    return NextResponse.json(
      { error: body.message ?? 'Failed to delete auth user' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
