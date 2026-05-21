import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/* Full-screen layout — no sidebar, no topbar.
   Handles auth + onboarding-complete guard so the page doesn't have to. */
export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app/onboarding');

  // If already completed, send to dashboard
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, onboarding_complete')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (biz?.onboarding_complete) redirect('/app/business_dashboard');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
      {children}
    </div>
  );
}
