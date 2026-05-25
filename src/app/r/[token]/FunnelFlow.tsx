'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { trackEvent } from '@/lib/analytics/events';

/* ── Types ─────────────────────────────────────────────── */

export type BusinessData = {
  name:               string;
  tagline:            string;
  googleLink:         string;                                                 // kept for backward compat
  reviewPlatforms:    { id: string; url: string; enabled: boolean }[];       // multi-platform support
  brandColor:         string;
  logoInitials:       string;
  minRatingForGoogle: number;
  language:           string;
};

type Step = 'landing' | 'rating' | 'generating' | 'review' | 'private' | 'success';

/* ── Localised strings (minimal) ───────────────────────── */

const T = {
  en: {
    welcome:         'How was your experience?',
    welcomeSub:      'Your feedback helps us grow. It only takes 30 seconds.',
    start:           'Share your feedback',
    rateUs:          'Tap a star to rate your visit',
    generating:      'Crafting your review',
    generatingSub:   'Our AI is writing a personalised draft for you…',
    reviewReady:     'Here\'s your review draft',
    reviewSub:       'Review, edit, then post it — takes 10 seconds!',
    refresh:         'Try another',
    edit:            'Edit',
    copyGo:          'Copy & post review',
    copyGoSingle:    'Copy & open',          // appended with platform name at render time
    copied:          'Copied!',
    choosePlatform:  'Now open your preferred platform and paste it:',
    privateTitle:    'We\'re sorry to hear that',
    privateSub:      'Your feedback is private and helps us improve. What can we do better?',
    privatePlaceholder: 'Tell us what happened…',
    submitFeedback:  'Send private feedback',
    submitting:      'Sending…',
    successTitle:    'Thank you!',
    successSub:      'Your feedback makes a real difference for our team.',
    successGoogle:   'Review copied! Open your review platform and paste it there.',
    starLabels:      'Terrible,Poor,Okay,Good,Amazing!',
  },
  es: {
    welcome:         '¿Cómo fue tu experiencia?',
    welcomeSub:      'Tu opinión nos ayuda a mejorar. Solo toma 30 segundos.',
    start:           'Comparte tu opinión',
    rateUs:          'Toca una estrella para calificar',
    generating:      'Creando tu reseña',
    generatingSub:   'Nuestra IA escribe un borrador personalizado para ti…',
    reviewReady:     'Aquí está tu borrador',
    reviewSub:       '¡Revísalo, edítalo y publícalo — tarda 10 segundos!',
    refresh:         'Probar otra',
    edit:            'Editar',
    copyGo:          'Copiar y publicar reseña',
    copyGoSingle:    'Copiar y abrir',
    copied:          '¡Copiado!',
    choosePlatform:  'Abre tu plataforma y pega la reseña:',
    privateTitle:    'Lamentamos escuchar eso',
    privateSub:      'Tu comentario es privado y nos ayuda a mejorar.',
    privatePlaceholder: 'Cuéntanos qué pasó…',
    submitFeedback:  'Enviar comentarios',
    submitting:      'Enviando…',
    successTitle:    '¡Gracias!',
    successSub:      'Tu opinión marca una diferencia real para nuestro equipo.',
    successGoogle:   '¡Reseña copiada! Abre tu plataforma y pégala ahí.',
    starLabels:      'Pésimo,Malo,Regular,Bueno,¡Genial!',
  },
};

function t(lang: string, key: keyof typeof T['en']): string {
  const locale = (T as Record<string, typeof T['en']>)[lang] ?? T.en;
  return locale[key] ?? T.en[key];
}

/* ── Platform helpers ────────────────────────────────── */

const PLATFORM_META: Record<string, { name: string; emoji: string; color: string }> = {
  google:        { name: 'Google Reviews',        emoji: '🔍', color: '#4285F4' },
  yelp:          { name: 'Yelp',                  emoji: '⭐', color: '#FF1A1A' },
  tripadvisor:   { name: 'TripAdvisor',           emoji: '🦉', color: '#00AF87' },
  trustpilot:    { name: 'Trustpilot',            emoji: '🌟', color: '#00B67A' },
  facebook:      { name: 'Facebook Reviews',      emoji: '👍', color: '#1877F2' },
  yandex:        { name: 'Yandex Maps',           emoji: '🗺️', color: '#FC3F1D' },
  '2gis':        { name: '2GIS',                  emoji: '📌', color: '#31A44A' },
  flamp:         { name: 'Flamp',                 emoji: '💬', color: '#FF6600' },
  booking:       { name: 'Booking.com',           emoji: '🏨', color: '#003580' },
  zomato:        { name: 'Zomato',                emoji: '🍽️', color: '#E23744' },
  talabat:       { name: 'Talabat',               emoji: '🚚', color: '#FF6600' },
  productreview: { name: 'ProductReview.com.au',  emoji: '🛒', color: '#E87722' },
  truelocal:     { name: 'True Local',            emoji: '📍', color: '#007FC8' },
  checkatrade:   { name: 'Checkatrade',           emoji: '🔧', color: '#005DAA' },
};

function platformMeta(id: string) {
  return PLATFORM_META[id] ?? { name: id, emoji: '⭐', color: '#6E5BFF' };
}

/* ── AI review generation ─────────────────────────────── */

type Draft = { text: string; reviewId: string | null };

async function fetchDrafts(token: string, rating: number): Promise<Draft[]> {
  const res = await fetch('/api/funnel/generate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token, rating }),
  });
  if (!res.ok) throw new Error(`Generation failed: ${res.status}`);
  const json = await res.json();
  const arr = Array.isArray(json.drafts) ? json.drafts : [];
  return arr.map((d: { text: string; review_id: string }) => ({
    text:     d.text,
    reviewId: d.review_id ?? null,
  }));
}

async function updateReviewStatus(
  token: string,
  reviewId: string,
  action: 'copy' | 'redirect',
  platform?: string,
): Promise<void> {
  await fetch('/api/funnel/status', {
    method:    'PATCH',
    headers:   { 'Content-Type': 'application/json' },
    body:      JSON.stringify({ token, review_id: reviewId, action, platform }),
    keepalive: true,
  }).catch(() => {});
}

async function submitPrivateFeedback(token: string, rating: number, feedback: string): Promise<void> {
  await fetch('/api/funnel/private', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token, rating, feedback }),
    keepalive: true,
  });
}

/* ── Star SVG ─────────────────────────────────────────── */

function StarIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg className={`rv-star-svg${filled ? ' active' : ''}`} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4l5.09 10.26L41 15.27l-8.5 8.27 2.01 11.72L24 30l-10.51 5.26 2.01-11.72L7 15.27l11.91-1.01L24 4z"
        fill={filled ? color : '#E5E7EB'}
        stroke={filled ? color : '#D1D5DB'}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────── */

export default function FunnelFlow({
  business,
  token,
  valid,
}: {
  business: BusinessData | null;
  token: string;
  valid: boolean;
}) {
  const [step, setStep]       = useState<Step>('landing');
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [drafts, setDrafts]   = useState<Draft[]>([]);
  const [draftIdx, setDraftIdx] = useState(0);
  const [editing, setEditing]   = useState(false);
  const [editedText, setEditedText] = useState('');
  const [copied, setCopied]         = useState(false);
  const [copiedReviewId, setCopiedReviewId] = useState<string | null>(null);
  const [genError, setGenError]     = useState('');
  const [privateFb, setPrivateFb]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [visible, setVisible]       = useState(true);

  const currentDraft = drafts[draftIdx] ?? null;
  const reviewText   = editing ? editedText : (currentDraft?.text ?? '');
  const reviewId     = currentDraft?.reviewId ?? null;

  const lang  = business?.language  ?? 'en';
  const brand = business?.brandColor ?? '#6E5BFF';

  // Resolve active platforms; fall back to googleLink for old records
  const activePlatforms = (business?.reviewPlatforms ?? []).filter(p => p.enabled && p.url.trim());
  const resolvedPlatforms = activePlatforms.length > 0
    ? activePlatforms
    : (business?.googleLink ? [{ id: 'google', url: business.googleLink, enabled: true }] : []);
  const isMultiPlatform = resolvedPlatforms.length > 1;

  /* transition helper */
  const goTo = useCallback((next: Step) => {
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 200);
  }, []);

  /* track analytics event — live via /api/analytics/event */
  const track = useCallback((event: Parameters<typeof trackEvent>[0]['event'], extra?: Record<string, unknown>) => {
    void trackEvent({ token, event, meta: extra });
  }, [token]);

  /* fire scan exactly once on mount — ref guard prevents the double-fire
     that React StrictMode causes in development */
  const scanFired = useRef(false);
  useEffect(() => {
    if (valid && !scanFired.current) {
      scanFired.current = true;
      track('scan');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* handle star selection — fetches 2 drafts, shows the first */
  async function handleStar(stars: number) {
    setRating(stars);
    if (stars >= (business?.minRatingForGoogle ?? 4)) {
      setGenError('');
      goTo('generating');
      try {
        const fetched = await fetchDrafts(token, stars);
        setDrafts(fetched);
        setDraftIdx(0);
        setEditing(false);
        setEditedText(fetched[0]?.text ?? '');
        track('generate');
        goTo('review');
      } catch {
        setGenError('Could not generate a draft. Please try again.');
        goTo('rating');
      }
    } else {
      setTimeout(() => goTo('private'), 350);
    }
  }

  /* refresh — show the pre-generated 2nd draft instantly (no API call) */
  function handleRefresh() {
    setCopied(false);
    setCopiedReviewId(null);
    setEditing(false);
    const next = drafts.length > 1 ? (draftIdx + 1) % drafts.length : draftIdx;
    setDraftIdx(next);
    setEditedText(drafts[next]?.text ?? '');
    track('refresh', { draft_index: next });
  }

  /* Single-platform: copy + open URL + go to success in one click.
     Multi-platform: copy + show platform selector (user must choose).
     window.open must fire BEFORE the first await or pop-up blockers will kill it. */
  async function handleCopyAndGo(singlePlatform?: { id: string; url: string }) {
    // Open tab synchronously inside the click event, before any await
    if (singlePlatform?.url) window.open(singlePlatform.url, '_blank');

    try { await navigator.clipboard.writeText(reviewText); } catch {}

    track('copy', { draft_index: draftIdx });
    if (reviewId) void updateReviewStatus(token, reviewId, 'copy');

    if (singlePlatform) {
      track('redirect', { platform: singlePlatform.id });
      if (reviewId) void updateReviewStatus(token, reviewId, 'redirect', singlePlatform.id);
      goTo('success');
    } else {
      // Multi-platform: lock in the review ID at copy time, then show platform picker
      setCopiedReviewId(reviewId);
      setCopied(true);
    }
  }

  function openPlatform(url: string, id: string) {
    if (url) window.open(url, '_blank');
    track('redirect', { platform: id });
    // Use copiedReviewId (locked at copy time) so "Try another" between copy and
    // platform-click cannot cause the redirect to be attributed to the wrong review.
    const trackId = copiedReviewId ?? reviewId;
    if (trackId) void updateReviewStatus(token, trackId, 'redirect', id);
    goTo('success');
  }

  /* private feedback submit — saves to DB and fires analytics */
  async function handlePrivateSubmit() {
    if (!privateFb.trim()) return;
    setSubmitting(true);
    track('private_feedback', { rating, feedback: privateFb });
    await submitPrivateFeedback(token, rating, privateFb).catch(() => {/* fail silently */});
    setSubmitted(true);
    setTimeout(() => goTo('success'), 700);
  }

  /* Redirect from success if Google tab was opened */
  useEffect(() => {
    if (step === 'success') track('complete');
  }, [step, track]);

  /* ── Invalid token ──────────────────────────────────── */

  if (!valid || !business) {
    return (
      <div className="rv-funnel-root" style={{ '--rv-brand': '#6E5BFF' } as React.CSSProperties}>
        <div className="rv-invalid">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
            <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.15)"/>
            <path d="M20 20l16 16M36 20L20 36" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <h2>Link not found</h2>
          <p>This QR code link is invalid or has expired. Please ask the business for an updated code.</p>
        </div>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div
      className="rv-funnel-root"
      style={{ '--rv-brand': brand } as React.CSSProperties}
    >
      <div className={`rv-funnel-card ${visible ? 'rv-step-enter' : 'rv-step-exit'}`}>

        {/* Header — always visible */}
        <div className="rv-funnel-header">
          <div className="rv-funnel-logo" style={{ background: brand }}>
            {business.logoInitials}
          </div>
          <div>
            <p className="rv-funnel-biz-name">{business.name}</p>
            {business.tagline && <p className="rv-funnel-tagline">{business.tagline}</p>}
          </div>
        </div>

        <div className="rv-divider" style={{ margin: '16px 28px 0' }}/>

        {/* Body */}
        <div className="rv-funnel-body">

          {/* LANDING ──────────────────────────── */}
          {step === 'landing' && (
            <>
              <h2 className="rv-funnel-step-title">{t(lang, 'welcome')}</h2>
              <p className="rv-funnel-step-sub">{t(lang, 'welcomeSub')}</p>
              <button className="rv-btn rv-btn-primary" onClick={() => goTo('rating')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1.5l2.09 4.24L16 6.62l-3.5 3.4.83 4.82L9 12.5l-4.33 2.34.83-4.82L2 6.62l4.91-.88L9 1.5z"
                    fill="currentColor"/>
                </svg>
                {t(lang, 'start')}
              </button>
            </>
          )}

          {/* RATING ───────────────────────────── */}
          {step === 'rating' && (
            <>
              <h2 className="rv-funnel-step-title">{t(lang, 'rateUs')}</h2>
              <div className="rv-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    className="rv-star-btn"
                    onClick={() => handleStar(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    aria-label={`${s} star`}
                  >
                    <StarIcon filled={s <= (hovered || rating)} color={brand} />
                  </button>
                ))}
              </div>
              <div className="rv-star-label" style={{ color: hovered || rating ? brand : undefined }}>
                {hovered
                  ? t(lang, 'starLabels').split(',')[hovered - 1] ?? t(lang, 'starLabels').split(',')[4]
                  : rating
                    ? t(lang, 'starLabels').split(',')[rating - 1] ?? ''
                    : ''}
              </div>
              {genError && (
                <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10, textAlign: 'center' }}>{genError}</p>
              )}
            </>
          )}

          {/* GENERATING ──────────────────────── */}
          {step === 'generating' && (
            <div className="rv-generating">
              <div className="rv-spinner-ring"/>
              <p className="rv-generating-title">
                {t(lang, 'generating')}<span className="rv-generating-dots"/>
              </p>
              <p className="rv-funnel-step-sub" style={{ margin: 0 }}>{t(lang, 'generatingSub')}</p>
            </div>
          )}

          {/* REVIEW ──────────────────────────── */}
          {step === 'review' && (
            <>
              <h2 className="rv-funnel-step-title">{t(lang, 'reviewReady')}</h2>
              <p className="rv-funnel-step-sub">{t(lang, 'reviewSub')}</p>

              <div className="rv-review-card">
                {editing ? (
                  <textarea
                    className="rv-review-textarea"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <p className="rv-review-text">{reviewText}</p>
                )}
              </div>

              <div className="rv-review-actions">
                <button className="rv-btn rv-btn-ghost" onClick={handleRefresh}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M13 7.5A5.5 5.5 0 112.5 4.5M2.5 1.5v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t(lang, 'refresh')}
                </button>
                <button className="rv-btn rv-btn-ghost" onClick={() => { if (!editing) setEditedText(currentDraft?.text ?? ''); setEditing(e => !e); }}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M10 2l3 3-8 8H2v-3l8-8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                  {t(lang, 'edit')}
                </button>
              </div>

              {/* Copy button:
                  - Single platform → copy + open URL + success (one click)
                  - Multi platform  → copy + show platform selector */}
              {!copied && (
                <button
                  className="rv-btn rv-btn-primary"
                  onClick={() => handleCopyAndGo(isMultiPlatform ? undefined : resolvedPlatforms[0])}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="5" y="5" width="9" height="9" rx="2" stroke="white" strokeWidth="1.5"/>
                    <path d="M3 11V3h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {isMultiPlatform
                    ? t(lang, 'copyGo')
                    : `${t(lang, 'copyGoSingle')} ${platformMeta(resolvedPlatforms[0]?.id ?? 'google').name}`}
                </button>
              )}

              {/* Step 2: After copy — show "Copied!" + platform buttons */}
              {copied && (
                <div style={{ marginTop: 4 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 7, marginBottom: 14, fontSize: 13, color: '#16a34a', fontWeight: 600,
                  }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M3 7.5l3.5 3.5 5.5-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {t(lang, 'copied')}
                  </div>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 10, textAlign: 'center' }}>
                    {t(lang, 'choosePlatform')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {resolvedPlatforms.map(p => {
                      const meta = platformMeta(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => openPlatform(p.url, p.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                            padding: '11px 16px', borderRadius: 10, border: 'none',
                            background: meta.color, color: '#fff',
                            fontWeight: 600, fontSize: 14, cursor: 'pointer',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                          }}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1 }}>{meta.emoji}</span>
                          Open {meta.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PRIVATE FEEDBACK ────────────────── */}
          {step === 'private' && (
            <>
              <h2 className="rv-funnel-step-title">{t(lang, 'privateTitle')}</h2>
              <p className="rv-funnel-step-sub">{t(lang, 'privateSub')}</p>
              <textarea
                className="rv-private-textarea"
                placeholder={t(lang, 'privatePlaceholder')}
                value={privateFb}
                onChange={(e) => setPrivateFb(e.target.value)}
                rows={4}
              />
              <button
                className="rv-btn rv-btn-primary"
                onClick={handlePrivateSubmit}
                disabled={!privateFb.trim() || submitting}
              >
                {submitting && !submitted ? (
                  <><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'white',borderRadius:'50%',animation:'rv-spin 0.7s linear infinite' }}/> {t(lang, 'submitting')}</>
                ) : submitted ? (
                  <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Sent!</>
                ) : t(lang, 'submitFeedback')}
              </button>
            </>
          )}

          {/* SUCCESS ─────────────────────────── */}
          {step === 'success' && (
            <div className="rv-success">
              <div className="rv-success-icon">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <path d="M8 18l7 7 13-13" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="rv-success-title">{t(lang, 'successTitle')}</p>
              <p className="rv-success-sub">
                {rating >= (business.minRatingForGoogle ?? 4)
                  ? t(lang, 'successGoogle')
                  : t(lang, 'successSub')}
              </p>
            </div>
          )}

        </div>
      </div>

      <p className="rv-poweredby">
        Powered by <a href="/" target="_blank" rel="noopener">Reevo</a>
      </p>
    </div>
  );
}
