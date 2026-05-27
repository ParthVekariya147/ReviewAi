import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { getStripe } from '@/lib/billing/stripe';
import { env } from '@/lib/env';

/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session and returns { url }.
 * Requires an existing Stripe Customer (i.e. the business must have subscribed before).
 */
export async function POST() {
  const supabase = await createClient();
  const db = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { business, error: bizError } = await getCurrentBusiness(db as Awaited<ReturnType<typeof createClient>>, user.id);
  if (bizError || !business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  const { data: sub } = await db
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('business_id', business.id as string)
    .maybeSingle();

  const stripeCustomerId = (sub as { stripe_customer_id?: string } | null)?.stripe_customer_id;
  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found. Please subscribe first.' }, { status: 404 });
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer:   stripeCustomerId,
    return_url: `${env.APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
