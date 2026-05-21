import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScreenFunnel from '@/components/dashboard/screens/ScreenFunnel';

export default async function FunnelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app/business_dashboard/funnel-manager');

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <ScreenFunnel
      initialBusiness={business ?? null}
      user={{
        id:        user.id,
        email:     user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
      }}
    />
  );
}
