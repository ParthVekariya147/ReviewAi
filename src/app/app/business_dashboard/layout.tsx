import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ProfileIncompleteBanner from '@/components/dashboard/ProfileIncompleteBanner';

const ONBOARDING_PATH = '/app/business_dashboard/onboarding';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/app/business_dashboard');

  const { business: biz } = await getCurrentBusiness(supabase, user.id);

  // Read the current pathname that the middleware injected into request headers.
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isOnboardingRoute = pathname === ONBOARDING_PATH || pathname.startsWith(ONBOARDING_PATH + '/');

  // If onboarding is not yet complete, redirect to the embedded onboarding page
  // unless we are already on that page (which would create an infinite redirect).
  if (!biz?.onboarding_complete && !isOnboardingRoute) {
    redirect(ONBOARDING_PATH);
  }

  // Onboarding has its own full-screen layout — no sidebar or topbar
  if (isOnboardingRoute) {
    return <>{children}</>;
  }

  const fullName: string = user.user_metadata?.full_name || '';
  const email: string    = user.email ?? '';
  const ownerName        = fullName || email.split('@')[0];

  // Detect fields that became required but may be missing for existing users
  const missingProfileFields: string[] = [];
  if (biz?.onboarding_complete) {
    if (!String(biz.tagline ?? '').trim())       missingProfileFields.push('tagline');
    if (!String(biz.business_type ?? '').trim()) missingProfileFields.push('business_type');
    if (!String(biz.owner_name ?? '').trim())    missingProfileFields.push('owner_name');
  }

  return (
    <DashboardShell
      ownerName={ownerName}
      sidebar={{
        ownerName,
        ownerEmail: email,
        bizName:     String(biz?.name ?? ''),
        bizInitials: String(biz?.logo_initials ?? ''),
        bizColor:    String(biz?.brand_color ?? '#6366F1'),
        bizPlan:     String(biz?.plan ?? 'free'),
        bizLogoUrl:  (biz?.logo_url as string | null) ?? null,
      }}
      banner={<ProfileIncompleteBanner missingFields={missingProfileFields} />}
    >
      {children}
    </DashboardShell>
  );
}
