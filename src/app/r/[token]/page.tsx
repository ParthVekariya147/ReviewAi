import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import FunnelFlow, { type BusinessData } from './FunnelFlow';

export const metadata: Metadata = {
  title: 'Share your experience',
  description: 'Leave a quick review — it only takes 30 seconds.',
};

async function lookupToken(token: string): Promise<BusinessData | null> {
  try {
    const supabase = await createClient();
    const { data: qr } = await supabase
      .from('qr_codes')
      .select(`
        id, token, status,
        businesses (
          name, tagline, google_link, brand_color,
          logo_initials, min_rating_for_google, language
        )
      `)
      .eq('token', token)
      .eq('status', 'live')
      .single();

    if (!qr || !qr.businesses) return null;

    const biz = (Array.isArray(qr.businesses) ? qr.businesses[0] : qr.businesses) as {
      name: string; tagline: string | null; google_link: string | null;
      brand_color: string; logo_initials: string;
      min_rating_for_google: number; language: string;
    };

    return {
      name:               biz.name,
      tagline:            biz.tagline     ?? '',
      googleLink:         biz.google_link ?? '',
      brandColor:         biz.brand_color,
      logoInitials:       biz.logo_initials,
      minRatingForGoogle: biz.min_rating_for_google,
      language:           biz.language,
    };
  } catch {
    /* Supabase not configured in dev — serve a demo business */
    return {
      name:               'Olive & Pine',
      tagline:            "NW Portland's favourite Italian kitchen",
      googleLink:         'https://g.page/r/demo-review-link',
      brandColor:         '#6E5BFF',
      logoInitials:       'OP',
      minRatingForGoogle: 4,
      language:           'en',
    };
  }
}

export default async function FunnelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const business = await lookupToken(token);

  return (
    <FunnelFlow
      business={business}
      token={token}
      valid={business !== null}
    />
  );
}
