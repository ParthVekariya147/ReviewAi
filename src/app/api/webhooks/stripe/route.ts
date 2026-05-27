import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/billing/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { env } from '@/lib/env';

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events. Verified via Stripe-Signature header.
 * Supported events:
 *   - customer.subscription.created / updated / deleted
 *   - invoice.paid / invoice.payment_failed
 *
 * To switch from test to live:
 *   1. Replace STRIPE_SECRET_KEY with live key (sk_live_...)
 *   2. Replace STRIPE_WEBHOOK_SECRET with the live endpoint secret
 *   3. Create a live webhook endpoint in the Stripe dashboard pointing to this URL
 */
export async function POST(req: NextRequest) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook/stripe] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook/stripe] Signature verification failed:', msg);
    return NextResponse.json({ error: `Webhook signature invalid: ${msg}` }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error('[webhook/stripe] Handler error:', err);
    return NextResponse.json({ error: 'Internal handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Event handlers ──────────────────────────────────────────────────────────

async function handleEvent(event: Stripe.Event) {
  const db = createAdminClient();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscription(db, sub);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await cancelSubscription(db, sub);
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await recordInvoice(db, invoice, 'paid');
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await recordInvoice(db, invoice, 'open');
      // Mark subscription past_due
      const subId = getInvoiceSubscriptionId(invoice);
      if (subId) {
        await db
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('provider_id', subId);
      }
      break;
    }
    default:
      // Unhandled event — return 200 so Stripe doesn't retry
      break;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  // Stripe API 2026-04-22: subscription moved from Invoice.subscription → Invoice.parent.subscription_details.subscription
  const sub = invoice.parent?.subscription_details?.subscription;
  if (!sub) return null;
  return typeof sub === 'string' ? sub : sub.id;
}

type DbClient = ReturnType<typeof createAdminClient>;

function stripePlanFromPriceId(priceId: string | null): string {
  if (!priceId) return 'free';
  if (priceId === env.STRIPE_PRICE_STARTER)    return 'starter';
  if (priceId === env.STRIPE_PRICE_PRO)        return 'pro';
  if (priceId === env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';
  return 'starter';
}

async function upsertSubscription(db: DbClient, sub: Stripe.Subscription) {
  const businessId = sub.metadata?.business_id;
  if (!businessId) {
    console.warn('[webhook/stripe] subscription missing business_id metadata:', sub.id);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan = stripePlanFromPriceId(priceId);

  // current_period_end moved to SubscriptionItem in Stripe API 2026-04-22
  const periodEnd = sub.items.data[0]?.current_period_end ?? null;

  const record = {
    business_id:       businessId,
    plan,
    status:            sub.status,
    provider:          'stripe' as const,
    provider_id:       sub.id,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_end:     sub.cancel_at_period_end,
    updated_at:        new Date().toISOString(),
  };

  await db.from('subscriptions').upsert(record, { onConflict: 'provider_id' });

  // Keep businesses.plan in sync
  await db.from('businesses').update({ plan }).eq('id', businessId);
}

async function cancelSubscription(db: DbClient, sub: Stripe.Subscription) {
  await db
    .from('subscriptions')
    .update({ status: 'canceled', cancel_at_end: false, updated_at: new Date().toISOString() })
    .eq('provider_id', sub.id);

  const businessId = sub.metadata?.business_id;
  if (businessId) {
    await db.from('businesses').update({ plan: 'free' }).eq('id', businessId);
  }
}

async function recordInvoice(db: DbClient, invoice: Stripe.Invoice, status: string) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const { data: sub } = await db
    .from('subscriptions')
    .select('id, business_id')
    .eq('provider_id', subscriptionId)
    .maybeSingle();

  if (!sub) return;

  const record = {
    subscription_id: sub.id,
    business_id:     sub.business_id,
    provider:        'stripe',
    provider_id:     invoice.id,
    amount_cents:    invoice.amount_paid ?? invoice.amount_due ?? 0,
    currency:        invoice.currency ?? 'usd',
    status,
    invoice_pdf:     invoice.invoice_pdf ?? null,
    period_start:    new Date(invoice.period_start * 1000).toISOString(),
    period_end:      new Date(invoice.period_end * 1000).toISOString(),
    paid_at:         status === 'paid' ? new Date().toISOString() : null,
  };

  await db.from('invoices').upsert(record, { onConflict: 'provider_id' });
}
