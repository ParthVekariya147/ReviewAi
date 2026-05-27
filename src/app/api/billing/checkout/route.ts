import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentBusiness } from '@/lib/businesses/current';
import { getStripe, PLAN_PRICE_IDS } from '@/lib/billing/stripe';
import { env } from '@/lib/env';

/**
 * POST /api/billing/checkout
 * Body: { plan: 'starter' | 'pro' | 'enterprise' }
 *
 * Creates a Stripe Checkout Session and returns { url }.
 * The session creates/reuses a Stripe Customer tied to this business.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const db = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { business, error: bizError } = await getCurrentBusiness(db as Awaited<ReturnType<typeof createClient>>, user.id);
  if (bizError || !business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { plan?: string };
  const { plan } = body;

  if (!plan || !['starter', 'pro', 'enterprise'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: `Stripe price ID not configured for plan "${plan}". Set STRIPE_PRICE_${plan.toUpperCase()} in environment variables.` }, { status: 503 });
  }

  const stripe = getStripe();
  const appUrl = env.APP_URL;

  // Resolve or create Stripe Customer
  let customerId: string | undefined;
  const { data: sub } = await db
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('business_id', business.id as string)
    .maybeSingle();

  const stripeCustomerId = (sub as { stripe_customer_id?: string } | null)?.stripe_customer_id;
  if (stripeCustomerId) {
    customerId = stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name:  (business as { name?: string }).name ?? undefined,
      metadata: { business_id: business.id as string, user_id: user.id },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode:       'subscription',
    customer:   customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success&plan=${plan}`,
    cancel_url:  `${appUrl}/pricing`,
    subscription_data: {
      metadata: { business_id: business.id as string },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
