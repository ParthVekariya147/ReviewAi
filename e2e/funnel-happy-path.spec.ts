/**
 * E2E tests for the customer-facing funnel (/r/[token]).
 *
 * ── Two test groups ──────────────────────────────────────────────
 *
 * 1. "structural" tests — no Supabase needed.
 *    They hit /r/invalid-token-xyz which returns `valid=false`,
 *    showing the "Link not found" fallback UI.
 *
 * 2. "happy path" tests — require a seeded live QR token.
 *    Set TEST_QR_TOKEN in .env.test (run the seed helper first).
 *    Client-side API calls (/api/funnel/generate, status, private)
 *    are mocked with page.route() so no AI key is needed.
 *
 * ── Setup ────────────────────────────────────────────────────────
 *    cp .env.test.example .env.test   # fill in Supabase test project creds
 *    npx tsx e2e/helpers/seed.ts      # prints TEST_QR_TOKEN
 *    npm run test:e2e
 */

import { test, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test so TEST_QR_TOKEN is available
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

const TEST_TOKEN = process.env.TEST_QR_TOKEN ?? '';

// ── API mocks shared across happy-path tests ──────────────────

async function mockFunnelApis(page: Page) {
  // /api/funnel/generate → return 2 pre-baked drafts
  await page.route('**/api/funnel/generate', async (route) => {
    await route.fulfill({
      status:      200,
      contentType: 'application/json',
      body: JSON.stringify({
        drafts: [
          { text: 'Great coffee and friendly staff!',  review_id: 'test-review-id-1' },
          { text: 'Cozy atmosphere and great service.', review_id: 'test-review-id-2' },
        ],
      }),
    });
  });

  // /api/funnel/status — acknowledge copy/redirect
  await page.route('**/api/funnel/status', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // /api/funnel/private — acknowledge private feedback
  await page.route('**/api/funnel/private', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  // /api/analytics/event — swallow analytics silently
  await page.route('**/api/analytics/event', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });
}

// ── 1. Structural tests (no Supabase needed) ──────────────────

test.describe('funnel — invalid token', () => {
  test('shows "Link not found" for a non-existent token', async ({ page }) => {
    await page.goto('/r/this-token-does-not-exist-e2e');
    await expect(page.getByText('Link not found')).toBeVisible();
  });

  test('does not show the star rating UI for an invalid token', async ({ page }) => {
    await page.goto('/r/this-token-does-not-exist-e2e');
    // Stars should never appear when the token is invalid
    await expect(page.locator('[aria-label="5 star"]')).not.toBeVisible();
  });
});

// ── 2. Happy-path tests (require TEST_QR_TOKEN in .env.test) ──

test.describe('funnel — happy path (5-star → review → success)', () => {
  // Skip entire group when no seeded token is available
  test.skip(!TEST_TOKEN, 'TEST_QR_TOKEN not set in .env.test — run seed script first');

  test.beforeEach(async ({ page }) => {
    await mockFunnelApis(page);
  });

  test('landing page shows business name and start button', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await expect(page.getByText('Share your feedback')).toBeVisible();
    // Business name set by seed helper
    await expect(page.getByText('E2E Test Cafe')).toBeVisible();
  });

  test('clicking start shows the star rating UI', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await page.getByText('Share your feedback').click();
    await expect(page.locator('[aria-label="5 star"]')).toBeVisible();
    await expect(page.getByText('Tap a star to rate your visit')).toBeVisible();
  });

  test('5-star → generates draft → shows review card', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await page.getByText('Share your feedback').click();
    await page.locator('[aria-label="5 star"]').click();

    // Generating spinner should appear briefly
    // then the review step with the mocked draft text
    await expect(page.getByText('Great coffee and friendly staff!')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("Here's your review draft")).toBeVisible();
  });

  test('5-star → Copy & post → success screen', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await page.getByText('Share your feedback').click();
    await page.locator('[aria-label="5 star"]').click();

    await expect(page.getByText('Great coffee and friendly staff!')).toBeVisible({ timeout: 5_000 });

    // Grant clipboard permissions so the copy doesn't throw
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    // For single-platform, this button says "Copy & open"
    // For multi-platform, it says "Copy & post review"
    const copyBtn = page.getByRole('button', { name: /copy/i }).first();
    await copyBtn.click();

    // Should eventually reach success screen
    await expect(page.getByText('Thank you!')).toBeVisible({ timeout: 5_000 });
  });

  test('"Try another" swaps to the second pre-generated draft', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await page.getByText('Share your feedback').click();
    await page.locator('[aria-label="5 star"]').click();

    await expect(page.getByText('Great coffee and friendly staff!')).toBeVisible({ timeout: 5_000 });

    await page.getByRole('button', { name: /try another/i }).click();
    await expect(page.getByText('Cozy atmosphere and great service.')).toBeVisible();
  });
});

// ── 3. Low-rating path (1-star → private feedback) ───────────

test.describe('funnel — low-rating path (1-star → private feedback)', () => {
  test.skip(!TEST_TOKEN, 'TEST_QR_TOKEN not set in .env.test — run seed script first');

  test.beforeEach(async ({ page }) => {
    await mockFunnelApis(page);
  });

  test('1-star → shows private feedback form', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await page.getByText('Share your feedback').click();
    await page.locator('[aria-label="1 star"]').click();

    await expect(page.getByText("We're sorry to hear that")).toBeVisible({ timeout: 3_000 });
    await expect(page.getByPlaceholder('Tell us what happened…')).toBeVisible();
  });

  test('1-star → fill feedback → submit → success screen', async ({ page }) => {
    await page.goto(`/r/${TEST_TOKEN}`);
    await page.getByText('Share your feedback').click();
    await page.locator('[aria-label="1 star"]').click();

    await expect(page.getByPlaceholder('Tell us what happened…')).toBeVisible({ timeout: 3_000 });
    await page.getByPlaceholder('Tell us what happened…').fill('The service was slow and the order was wrong.');

    await page.getByRole('button', { name: /send private feedback/i }).click();

    await expect(page.getByText('Thank you!')).toBeVisible({ timeout: 5_000 });
  });
});

// ── 4. Auth redirect security (no Supabase needed) ───────────

test.describe('auth — open redirect prevention', () => {
  test('/login?next=https://evil.com redirects to default dashboard', async ({ page }) => {
    // The login page will likely redirect to Supabase auth or show a form.
    // We just verify the `next` parameter isn't reflected as an external URL.
    const response = await page.goto('/login?next=https://evil.com', { waitUntil: 'domcontentloaded' });
    // Should NOT end up at evil.com
    expect(page.url()).not.toContain('evil.com');
    // Should be on our domain
    expect(page.url()).toMatch(/localhost:3000/);
  });

  test('/login?next=//evil.com does not redirect off-domain', async ({ page }) => {
    await page.goto('/login?next=//evil.com', { waitUntil: 'domcontentloaded' });
    expect(page.url()).not.toContain('evil.com');
    expect(page.url()).toMatch(/localhost:3000/);
  });
});
