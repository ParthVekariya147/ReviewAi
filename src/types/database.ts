/* Auto-mirrors the database schema in database/001_initial_schema.sql */

export type BusinessPlan = 'free' | 'starter' | 'pro' | 'scale';
export type QRStatus    = 'draft' | 'live' | 'paused' | 'archived';
export type SubStatus   = 'active' | 'trialing' | 'past_due' | 'cancelled';
export type EventType   = 'scan' | 'generate' | 'refresh' | 'copy' | 'redirect' | 'complete' | 'private_feedback';

export interface Business {
  id:                    string;
  owner_id:              string;
  name:                  string;
  tagline:               string | null;
  google_link:           string | null;
  brand_color:           string;
  logo_initials:         string;
  min_rating_for_google: number;
  language:              string;
  plan:                  BusinessPlan;
  review_platforms:      { id: string; url: string; enabled: boolean }[];
  onboarding_complete:   boolean;
  created_at:            string;
  updated_at:            string;
}

export type ReviewPlatformEntry = Business['review_platforms'][number];

export interface QRCode {
  id:             string;
  business_id:    string;
  token:          string;
  campaign_name:  string;
  status:         QRStatus;
  dynamic:        boolean;
  ab_testing:     boolean;
  pause_fallback: boolean;
  created_at:     string;
  updated_at:     string;
}

export interface QRCodeWithBusiness extends QRCode {
  businesses: Business;
}

export interface QRScan {
  id:         string;
  qr_id:      string;
  device:     string | null;
  country:    string | null;
  scanned_at: string;
}

export interface GeneratedReview {
  id:         string;
  qr_id:      string;
  rating:     number;
  ai_text:    string;
  refreshes:  number;
  copies:     number;
  status:     'generated' | 'copied' | 'redirected' | 'submitted' | 'abandoned';
  created_at: string;
}

export interface AnalyticsEvent {
  id:          string;
  qr_id:       string | null;
  business_id: string | null;
  event_type:  EventType;
  device:      string | null;
  country:     string | null;
  meta:        Record<string, unknown> | null;
  created_at:  string;
}

export interface Subscription {
  id:                 string;
  business_id:        string;
  plan:               BusinessPlan;
  status:             SubStatus;
  provider:           string | null;
  provider_id:        string | null;
  current_period_end: string | null;
  cancel_at_end:      boolean;
  created_at:         string;
  updated_at:         string;
}

export interface Invoice {
  id:              string;
  subscription_id: string;
  business_id:     string;
  amount_cents:    number;
  currency:        string;
  status:          'paid' | 'open' | 'void';
  provider_inv_id: string | null;
  pdf_url:         string | null;
  created_at:      string;
}
