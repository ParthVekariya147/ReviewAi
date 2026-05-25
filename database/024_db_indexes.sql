-- 024_db_indexes.sql
-- Missing performance indexes identified in audit (TASK 5.1).
-- Run in Supabase SQL editor — each statement is safe to re-run (IF NOT EXISTS).
--
-- Trigram extension (required for name search index below)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text / trigram index on businesses.name — powers admin search without full table scan
CREATE INDEX IF NOT EXISTS businesses_name_trgm
  ON public.businesses USING gin(name gin_trgm_ops);

-- Scan count lookups: generated_reviews grouped by business_id
CREATE INDEX IF NOT EXISTS generated_reviews_business_id_idx
  ON public.generated_reviews(business_id);
