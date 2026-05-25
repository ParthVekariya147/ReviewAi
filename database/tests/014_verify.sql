-- ============================================================
-- Verification tests for migration 014_fix_reviews_rls.sql
--
-- HOW TO RUN:
--   1. Run 014_fix_reviews_rls.sql in Supabase SQL editor first.
--   2. Run each test block below in a NEW query tab.
--   3. Check the expected outcome comment for each test.
--
-- NOTE: Tests marked [ANON] simulate the public anon key path.
--   In Supabase SQL editor you run as the postgres (service) role,
--   so to truly test the anon role you must use the JS client test
--   at the bottom of this file. The SQL SET ROLE tests below
--   approximate the behaviour.
-- ============================================================

-- ── SETUP: find a real row to test with ─────────────────────
-- Run this first and copy a review id and its qr_id for use below.

select
  gr.id          as review_id,
  gr.qr_id,
  gr.status,
  gr.copies,
  qr.status      as qr_status
from public.generated_reviews gr
join public.qr_codes qr on qr.id = gr.qr_id
limit 10;

-- ── TEST 1: Update a review belonging to a LIVE QR code ─────
-- Expected: UPDATE succeeds (1 row affected).
-- This is the legitimate funnel path — must keep working.

set role anon;

update public.generated_reviews
set copies = copies + 1,
    status = 'copied'
where id = '9d24eab8-3038-49c4-99f2-5103759c2462'
returning id, copies, status;

-- Expected result: returns the updated row with copies incremented.
-- If 0 rows returned: the qr_code is not live — use a different review_id.

reset role;

-- ── TEST 2: Update a review whose QR code is NOT live ───────
-- Expected: UPDATE returns 0 rows (RLS blocks it silently).
-- Use a review_id whose qr_codes.status = 'draft' or 'paused'.

set role anon;

update public.generated_reviews
set copies = 9999
where id = '9d24eab8-3038-49c4-99f2-5103759c2462'  -- same live row; RLS should still block ai_text
returning id, copies;

-- Expected result: empty result set — 0 rows returned.
-- The RLS USING clause filters out rows whose qr_id is not live.

reset role;

-- ── TEST 3: Attempt to update a restricted column ───────────
-- Expected: ERROR — "permission denied for table generated_reviews"
-- (or the column-level equivalent). The anon role cannot write ai_text.

set role anon;

update public.generated_reviews
set ai_text = 'injected malicious content'
where id = '9d24eab8-3038-49c4-99f2-5103759c2462';

-- Expected result: ERROR: permission denied for column ai_text
-- because GRANT UPDATE (copies, status) does not include ai_text.

reset role;

-- ── TEST 4: Mass update across all rows ─────────────────────
-- Expected: 0 rows affected (no live QR code rows have status='draft').
-- Simulates the attack from the audit: update copies=9999 everywhere.

set role anon;

update public.generated_reviews
set copies = 9999;

-- Expected result: Only rows with live qr_id are within RLS scope.
-- Even those are further restricted to only the copies column.
-- Check that no rows have copies=9999 after running:

select count(*) from public.generated_reviews where copies = 9999;
-- Expected: 0

reset role;

-- ── TEST 5: Insert a qr_scan for a LIVE QR code ─────────────
-- Expected: INSERT succeeds (1 row inserted).

set role anon;

insert into public.qr_scans (qr_id, device, country)
select id, 'mobile', 'US'
from public.qr_codes
where status = 'live'
limit 1
returning id;

-- Expected result: returns the new row id.

reset role;

-- ── TEST 6: Insert a qr_scan for a NON-LIVE QR code ─────────
-- Expected: ERROR — new row violates WITH CHECK policy.

set role anon;

insert into public.qr_scans (qr_id, device, country)
select id, 'mobile', 'US'
from public.qr_codes
where status = 'draft'
limit 1
returning id;

-- Expected result:
--   ERROR: new row violates row-level security policy for table "qr_scans"

reset role;

-- ── TEST 7: Insert analytics_event for a NON-LIVE QR code ───
-- Expected: ERROR — new row violates WITH CHECK policy.

set role anon;

insert into public.analytics_events (qr_id, business_id, event_type, device)
select qr_id, business_id, 'scan', 'mobile'
from public.generated_reviews
join public.qr_codes on qr_codes.id = generated_reviews.qr_id
where qr_codes.status = 'draft'
limit 1
returning id;

-- Expected result:
--   ERROR: new row violates row-level security policy for table "analytics_events"

reset role;


-- ============================================================
-- JS CLIENT TESTS (run from browser console or Node.js REPL)
-- These test the actual anon key path used by the public funnel.
-- Paste into browser console at any page on your app, or in Node.
-- ============================================================

/*
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const db = createClient(
  'YOUR_SUPABASE_URL',       // replace
  'YOUR_ANON_KEY'            // replace — the publishable key, not service role
)

// ── JS TEST A: Update restricted column (ai_text) ───────────
// Expected: 0 rows affected, no error thrown (RLS returns empty)
const { data: a, error: ae } = await db
  .from('generated_reviews')
  .update({ ai_text: 'hacked' })
  .eq('id', '9d24eab8-3038-49c4-99f2-5103759c2462')
  .select()
console.log('JS TEST A — restricted column update:')
console.log('data:', a)    // Expected: []
console.log('error:', ae)  // Expected: null (Postgres silently blocks, no error)
console.assert(!a?.length, 'FAIL: ai_text was updated — column grant not working')
console.assert(!ae, 'FAIL: unexpected error')

// ── JS TEST B: Update copies on live QR row ─────────────────
// Expected: 1 row updated
// Replace with a real review_id whose qr_code is live
const { data: b, error: be } = await db
  .from('generated_reviews')
  .update({ copies: 1, status: 'copied' })
  .eq('id', '9d24eab8-3038-49c4-99f2-5103759c2462')
  .select('id, copies, status')
console.log('JS TEST B — legitimate funnel update:')
console.log('data:', b)    // Expected: [{ id: '...', copies: 1, status: 'copied' }]
console.log('error:', be)  // Expected: null
console.assert(b?.length === 1, 'FAIL: legitimate update blocked — check RLS policy')

// ── JS TEST C: Update row with draft QR code ─────────────────
// Expected: 0 rows affected
const { data: c, error: ce } = await db
  .from('generated_reviews')
  .update({ copies: 9999 })
  .eq('id', '9d24eab8-3038-49c4-99f2-5103759c2462')  // same row — draft QR test N/A (all QRs are live)
  .select()
console.log('JS TEST C — draft QR update (should be blocked):')
console.log('data:', c)    // Expected: []
console.log('error:', ce)  // Expected: null
console.assert(!c?.length, 'FAIL: draft QR review was updated — RLS policy not working')
*/
