import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/app/business_dashboard');

  // Block dashboard access until onboarding is complete
  const { business: biz } = await getCurrentBusiness(supabase, user.id);

  if (!biz || !biz.onboarding_complete) redirect('/app/onboarding');

  const fullName: string = user.user_metadata?.full_name || '';
  const email: string    = user.email ?? '';
  const ownerName        = fullName || email.split('@')[0];

  return (
    <div className="lp-root lp-app">
      <Sidebar ownerName={ownerName} />
      <main className="lp-main">
        <Topbar ownerName={ownerName} />
        {children}
      </main>
    </div>
  );
}
