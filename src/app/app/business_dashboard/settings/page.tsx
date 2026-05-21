import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScreenSettings from '@/components/dashboard/screens/ScreenSettings';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app/business_dashboard/settings');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <ScreenSettings
      initialBusiness={business ?? null}
      user={{
        id:        user.id,
        email:     user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
      }}
    />
  );
}
