-- Migration 019: Restrict qr_scans_public_insert to live QR codes only
-- Original policy: with check (true) — allowed anyone to insert fabricated scan records
-- directly via the Supabase anon client, bypassing the API rate limiter.
-- New policy: only allow inserts where the qr_id belongs to a live QR code.

DROP POLICY IF EXISTS "qr_scans_public_insert" ON public.qr_scans;

CREATE POLICY "qr_scans_public_insert" ON public.qr_scans
  FOR INSERT
  WITH CHECK (
    qr_id IN (
      SELECT id FROM public.qr_codes WHERE status = 'live'
    )
  );
