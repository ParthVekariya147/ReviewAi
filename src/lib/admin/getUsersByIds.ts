import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Batch lookup of auth.users emails by ID array.
 * Fetches each user by ID in parallel — O(n) targeted requests instead of
 * scanning the entire auth.users table with paginated listUsers.
 */
export async function getUserEmailsByIds(
  db: SupabaseClient,
  ids: string[],
): Promise<Record<string, string>> {
  if (ids.length === 0) return {};

  const results = await Promise.all(ids.map(id => db.auth.admin.getUserById(id)));

  const map: Record<string, string> = {};
  results.forEach(({ data }, i) => {
    if (data?.user?.email) map[ids[i]] = data.user.email;
  });

  return map;
}
