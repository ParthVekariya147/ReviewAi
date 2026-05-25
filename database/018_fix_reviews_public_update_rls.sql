-- Migration 018: Remove overly permissive reviews_public_update RLS policy
-- The original policy allowed ANY unauthenticated user to update ANY row in
-- generated_reviews directly via the Supabase anon key, bypassing API auth.
-- The funnel/status API route now uses the service-role client to perform
-- updates after verifying QR token ownership, so no public update policy is needed.

DROP POLICY IF EXISTS "reviews_public_update" ON public.generated_reviews;
