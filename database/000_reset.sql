-- ============================================================
-- Reevo — Full Reset (DEV ONLY)
-- Drops all tables, triggers, functions, and policies.
-- Run this ONCE in Supabase SQL Editor, then run 001 and 002.
-- WARNING: Deletes all data. Only use in development.
-- ============================================================

-- Drop tables in reverse dependency order (FK safe)
drop table if exists public.audit_logs         cascade;
drop table if exists public.invoices           cascade;
drop table if exists public.subscriptions      cascade;
drop table if exists public.analytics_events   cascade;
drop table if exists public.generated_reviews  cascade;
drop table if exists public.qr_scans           cascade;
drop table if exists public.qr_codes           cascade;
drop table if exists public.businesses         cascade;

-- Drop the updated_at trigger function
drop function if exists public.set_updated_at cascade;
