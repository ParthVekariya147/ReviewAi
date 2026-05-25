-- Migration 020: Add 'private_feedback' to generated_reviews.status CHECK constraint
-- The funnel/private route inserts status='private_feedback' but the constraint
-- in 015_constraints.sql only allows ('generated','copied','redirected','submitted','abandoned').
-- This causes a constraint violation / 500 error on every private feedback submission.

ALTER TABLE public.generated_reviews
  DROP CONSTRAINT IF EXISTS generated_reviews_status_check;

ALTER TABLE public.generated_reviews
  ADD CONSTRAINT generated_reviews_status_check
  CHECK (status IN ('generated', 'copied', 'redirected', 'submitted', 'abandoned', 'private_feedback'));
