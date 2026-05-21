import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { redirect } from 'next/navigation';

/* Full-screen layout — no sidebar, no topbar.
   Handles auth + onboarding-complete guard so the page doesn't have to. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app/onboarding');

  // If already completed, send to dashboard
  const { business: biz } = await getCurrentBusiness(supabase, user.id);

  if (biz?.onboarding_complete) redirect('/app/business_dashboard');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
      {children}
    </div>
  );
}
