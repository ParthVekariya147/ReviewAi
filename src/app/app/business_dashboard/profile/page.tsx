import { createClient } from '@/lib/supabase/server';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { redirect } from 'next/navigation';
import ScreenProfile from '@/components/dashboard/screens/ScreenProfile';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/app/business_dashboard/profile');

  const { business: currentBusiness } = await getCurrentBusiness(supabase, user.id);
  const business = currentBusiness ? {
    id: String(currentBusiness.id),
    name: String(currentBusiness.name ?? ''),
    tagline: (currentBusiness.tagline as string | null) ?? null,
    google_link: (currentBusiness.google_link as string | null) ?? null,
    brand_color: String(currentBusiness.brand_color ?? '#6E5BFF'),
    logo_initials: String(currentBusiness.logo_initials ?? 'BZ'),
    min_rating_for_google: Number(currentBusiness.min_rating_for_google ?? 4),
    language: String(currentBusiness.language ?? 'en'),
    plan: String(currentBusiness.plan ?? 'free'),
    business_type:   (currentBusiness.business_type   as string | null) ?? null,
    review_keywords: (currentBusiness.review_keywords as string | null) ?? null,
  } : null;

  return (
    <ScreenProfile
      initialBusiness={business ?? null}
      user={{
        id:        user.id,
        email:     user.email ?? '',
        full_name: user.user_metadata?.full_name ?? '',
      }}
    />
  );
}
