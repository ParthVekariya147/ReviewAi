import Stripe from 'stripe';
import { env } from '@/lib/env';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('[stripe] STRIPE_SECRET_KEY is not set. Add it to your environment variables.');
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' });
  }
  return _stripe;
}

export const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  starter:    env.STRIPE_PRICE_STARTER,
  pro:        env.STRIPE_PRICE_PRO,
  enterprise: env.STRIPE_PRICE_ENTERPRISE,
};
