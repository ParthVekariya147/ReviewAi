/**
 * Google Review URL validation.
 * Shared between frontend (ScreenOnboarding) and backend (API route).
 *
 * Accepted formats:
 *   https://www.google.com/maps/place/...
 *   https://www.google.com/maps?...
 *   https://g.page/...
 *   https://search.google.com/local/writereview...
 *   https://maps.app.goo.gl/...
 *   https://goo.gl/maps/...
 */

const GOOGLE_REVIEW_PATTERNS: RegExp[] = [
  // Standard Maps place URL — any google TLD, optional country path prefix
  /^https:\/\/(www\.)?google\.[a-z]{2,6}(\/[a-z]{2})?\/maps\//i,
  // Short g.page links
  /^https:\/\/g\.page\//i,
  // Google Local writereview deep link
  /^https:\/\/search\.google\.com\/local\/writereview/i,
  // maps.app.goo.gl short links
  /^https:\/\/maps\.app\.goo\.gl\//i,
  // Legacy goo.gl/maps short links
  /^https:\/\/goo\.gl\/maps\//i,
];

export function isValidGoogleReviewUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  return GOOGLE_REVIEW_PATTERNS.some(pattern => pattern.test(trimmed));
}
