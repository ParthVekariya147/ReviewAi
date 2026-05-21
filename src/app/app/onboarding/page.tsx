import { createClient } from '@/lib/supabase/server';
import ScreenOnboarding from '@/components/dashboard/screens/ScreenOnboarding';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load any partial save so the wizard can pre-fill and resume
  const { data: biz } = await supabase
    .from('businesses')
    .select('name, tagline, brand_color, logo_initials, google_link, review_platforms, min_rating_for_google, language')
    .eq('owner_id', user!.id)
    .maybeSingle();

  return (
    <ScreenOnboarding
      user={{
        id:            user!.id,
        email:         user!.email            ?? '',
        full_name:     user!.user_metadata?.full_name     ?? '',
        business_name: user!.user_metadata?.business_name ?? '',
        google_link:   user!.user_metadata?.google_link   ?? '',
        industry:      user!.user_metadata?.industry      ?? '',
      }}
      existingBusiness={biz ?? null}
    />
  );
}
