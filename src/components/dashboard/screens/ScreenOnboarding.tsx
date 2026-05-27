'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Icon, Badge, Field, Input } from '../ui';
import { PLATFORM_DEFS, type ReviewPlatformEntry } from '@/lib/platforms';

// ── types ─────────────────────────────────────────────────────

interface UserMeta {
  id:            string;
  email:         string;
  full_name:     string;
  business_name: string;
  google_link:   string;
  industry:      string;
}

interface ExistingBusiness {
  name:             string;
  tagline:          string | null;
  brand_color:      string;
  logo_initials:    string;
  google_link:      string | null;
  review_platforms: ReviewPlatformEntry[];
  min_rating_for_google: number;
  language:         string;
  business_type:    string | null;
  review_keywords:  string | null;
}

interface Props {
  user:             UserMeta;
  existingBusiness: ExistingBusiness | null;
  initialStep?:     number;
}

// ── industry config ───────────────────────────────────────────

const INDUSTRY_CONFIG: Record<string, {
  label:     string;
  emoji:     string;
  platforms: string[];
  tip:       string;
}> = {
  restaurants: {
    label:     'Restaurant',
    emoji:     '🍽️',
    platforms: ['google', 'tripadvisor', 'yelp', 'zomato', 'facebook'],
    tip:       'Restaurants see 3× more reviews when Google + TripAdvisor are both active.',
  },
  salons: {
    label:     'Salon & Beauty',
    emoji:     '💇',
    platforms: ['google', 'facebook', 'yelp'],
    tip:       'Facebook Reviews drive 40% of salon referrals — add your page link.',
  },
  clinics: {
    label:     'Clinic & Health',
    emoji:     '🩺',
    platforms: ['google', 'facebook'],
    tip:       'Google Reviews dominate healthcare searches. Focus here first.',
  },
  cafes: {
    label:     'Café',
    emoji:     '☕',
    platforms: ['google', 'tripadvisor', 'yelp', 'facebook'],
    tip:       'TripAdvisor drives tourist traffic — great for cafés in busy areas.',
  },
  gyms: {
    label:     'Gym & Fitness',
    emoji:     '🏋️',
    platforms: ['google', 'facebook', 'yelp'],
    tip:       'Members trust Google Reviews most when choosing a new gym.',
  },
  retail: {
    label:     'Retail',
    emoji:     '🛍️',
    platforms: ['google', 'trustpilot', 'facebook', 'yelp'],
    tip:       'Trustpilot builds trust with online shoppers — pair it with Google.',
  },
  drycleaners: {
    label:     'Dry Cleaner',
    emoji:     '👔',
    platforms: ['google', 'facebook', 'yelp'],
    tip:       'Local Google Reviews drive walk-in traffic for neighbourhood services.',
  },
  services: {
    label:     'Service Business',
    emoji:     '🛠️',
    platforms: ['google', 'checkatrade', 'facebook', 'yelp'],
    tip:       'Checkatrade is trusted by homeowners hiring tradespeople in the UK.',
  },
  hotels: {
    label:     'Hotel',
    emoji:     '🏨',
    platforms: ['google', 'booking', 'tripadvisor', 'facebook'],
    tip:       'Booking.com + TripAdvisor are essential for hospitality businesses.',
  },
  hospitality: {
    label:     'Hospitality',
    emoji:     '🏨',
    platforms: ['google', 'booking', 'tripadvisor', 'facebook'],
    tip:       'Booking.com + TripAdvisor are essential for hospitality businesses.',
  },
};

const DEFAULT_INDUSTRY = {
  label:     'Business',
  emoji:     '🏢',
  platforms: ['google', 'facebook', 'tripadvisor'],
  tip:       'Start with Google Reviews — the most impactful platform for local search.',
};

function industryConfig(id: string) {
  return INDUSTRY_CONFIG[id?.toLowerCase()] ?? DEFAULT_INDUSTRY;
}

const KEYWORD_PLACEHOLDERS: Record<string, string> = {
  restaurants:  'wood-fired pizza, cozy patio, friendly staff',
  salons:       'colour specialists, relaxing atmosphere, precise cuts',
  clinics:      'caring doctors, short wait times, professional staff',
  cafes:        'specialty coffee, cozy seating, friendly baristas',
  gyms:         'modern equipment, expert trainers, clean facilities',
  retail:       'wide selection, knowledgeable staff, great prices',
  drycleaners:  'fast turnaround, careful handling, convenient location',
  services:     'reliable service, fair pricing, professional team',
  hotels:       'comfortable rooms, great location, attentive service',
  hospitality:  'warm welcome, clean facilities, excellent service',
};

function keywordPlaceholder(industry: string): string {
  return KEYWORD_PLACEHOLDERS[industry?.toLowerCase()] ?? 'friendly staff, great value, clean space';
}

// ── constants ─────────────────────────────────────────────────

const STEPS = [
  { key: 'details',   label: 'Details',   icon: 'building'  },
  { key: 'platforms', label: 'Platforms', icon: 'link'      },
  { key: 'branding',  label: 'Branding',  icon: 'sparkles'  },
  { key: 'launch',    label: 'Launch',    icon: 'check'     },
] as const;

const BRAND_COLORS = ['#6E5BFF','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#0F172A'];

// ── helpers ───────────────────────────────────────────────────

function autoInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

async function upsertBusiness(payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('/api/businesses', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  return res.ok;
}

// ── main component ────────────────────────────────────────────

export default function ScreenOnboarding({ user, existingBusiness, initialStep = 0 }: Props) {
  const router  = useRouter();
  const ind     = industryConfig(user.industry);

  const [step,      setStep]     = useState(Math.min(initialStep, STEPS.length - 1));
  const [saving,    setSaving]   = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error,     setError]    = useState('');

  // Form state — pre-fill from existing DB record if resuming
  const [form, setForm] = useState({
    name:            existingBusiness?.name     || user.business_name || '',
    tagline:         existingBusiness?.tagline  || '',
    color:           existingBusiness?.brand_color   || '#6E5BFF',
    initials:        existingBusiness?.logo_initials ||
                     autoInitials(existingBusiness?.name || user.business_name || ''),
    business_type:   existingBusiness?.business_type  ?? ind.label,
    review_keywords: existingBusiness?.review_keywords ?? '',
  });

  // Platforms — resume from DB or seed with industry recommendations
  const [platforms, setPlatforms] = useState<ReviewPlatformEntry[]>(() => {
    if (existingBusiness?.review_platforms?.length) {
      return existingBusiness.review_platforms;
    }
    return ind.platforms.map(id => ({
      id,
      url:     id === 'google' ? (user.google_link ?? '') : '',
      enabled: true,
    }));
  });

  function patchForm<K extends keyof typeof form>(key: K, val: typeof form[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  // ── platform helpers ──────────────────────────────────────
  function setPlatformUrl(id: string, url: string) {
    setPlatforms(ps => ps.map(p => p.id === id ? { ...p, url } : p));
  }
  function setPlatformEnabled(id: string, enabled: boolean) {
    setPlatforms(ps => ps.map(p => p.id === id ? { ...p, enabled } : p));
  }
  function addPlatform(id: string) {
    if (platforms.find(p => p.id === id)) return;
    setPlatforms(ps => [...ps, { id, url: '', enabled: true }]);
  }
  function removePlatform(id: string) {
    if (id === 'google') return;
    setPlatforms(ps => ps.filter(p => p.id !== id));
  }

  // ── step navigation with auto-save ───────────────────────
  function canAdvance(): boolean {
    if (step === 0) return form.name.trim().length > 0;
    return true;
  }

  async function saveAndNext() {
    if (!canAdvance()) return;
    setSaving(true);
    const googleUrl = platforms.find(p => p.id === 'google')?.url ?? '';
    await upsertBusiness({
      name:                form.name.trim(),
      tagline:             form.tagline.trim() || null,
      brand_color:         form.color,
      logo_initials:       form.initials || autoInitials(form.name),
      google_link:         googleUrl || null,
      review_platforms:    platforms,
      language:            'en',
      business_type:       form.business_type.trim() || null,
      review_keywords:     form.review_keywords.trim() || null,
      onboarding_complete: false,
      onboarding_step:     step + 1,
    });
    setSaving(false);
    setStep(s => s + 1);
  }

  function back() { setStep(s => Math.max(0, s - 1)); }

  // ── launch ────────────────────────────────────────────────
  async function handleLaunch() {
    setLaunching(true);
    setError('');

    // Mark onboarding complete — all other fields were saved in saveAndNext
    const res = await fetch('/api/businesses', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ onboarding_complete: true }),
    });
    const ok = res.ok;

    if (!ok) {
      setError('Something went wrong. Please try again.');
      setLaunching(false);
      return;
    }

    // Create the first live QR campaign
    await fetch('/api/qr', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ campaign_name: `${form.name.trim()} — Main`, status: 'live' }),
    });

    router.push('/app/business_dashboard');
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  // ── render ────────────────────────────────────────────────

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--lp-bg)' }}>

      {/* ── Top bar ── */}
      <header style={{
        height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', borderBottom: '1px solid var(--lp-border)',
        background: 'var(--lp-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6E5BFF,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none">
              <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Reevo</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user.industry && (
            <span style={{ fontSize: 13, color: 'var(--lp-fg-muted)' }}>
              {ind.emoji} Setting up your {ind.label}
            </span>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < step ? 'var(--lp-success)' : i === step ? 'var(--lp-primary)' : 'var(--lp-border)',
                  transition: 'background 0.2s',
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--lp-fg-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {step + 1} / {STEPS.length}
          </span>
          <div style={{ height: 16, width: 1, background: 'var(--lp-border)' }} />
          <span style={{ fontSize: 13, color: 'var(--lp-fg-muted)' }}>{user.email}</span>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 13, color: 'var(--lp-fg-muted)', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Progress bar ── */}
      <div style={{ height: 3, background: 'var(--lp-border)' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--lp-primary)', transition: 'width 0.35s ease' }} />
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 760 }}>

          {/* Step tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => i < step && setStep(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 999, border: 'none', cursor: i < step ? 'pointer' : 'default',
                  background: i === step ? 'var(--lp-primary)' : i < step ? 'var(--lp-success-soft, rgba(16,185,129,0.1))' : 'var(--lp-surface-raised)',
                  color: i === step ? '#fff' : i < step ? 'var(--lp-success)' : 'var(--lp-fg-muted)',
                  fontWeight: 600, fontSize: 12, transition: 'all 0.15s',
                }}
              >
                {i < step
                  ? <><Icon name="check" size={11} /> {s.label}</>
                  : <>{i + 1}. {s.label}</>
                }
              </button>
            ))}
          </div>

          {/* ── Step 0: Business details ──────────────────────── */}
          {step === 0 && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                {user.industry ? `Set up your ${ind.emoji} ${ind.label}` : 'Tell us about your business'}
              </h1>
              <p style={{ color: 'var(--lp-fg-muted)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>
                We&apos;ll personalise your review funnel and platform recommendations based on these details.
              </p>
              {existingBusiness && (
                <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon name="check" size={14} style={{ color: 'var(--lp-success)' }} />
                  <span style={{ fontSize: 12, color: 'var(--lp-success)', fontWeight: 500 }}>
                    Previous progress restored — continue from where you left off.
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Business name *">
                  <Input
                    value={form.name}
                    onChange={e => {
                      patchForm('name', e.target.value);
                      if (!existingBusiness?.logo_initials) {
                        patchForm('initials', autoInitials(e.target.value));
                      }
                    }}
                    placeholder="e.g. Olive & Pine Bistro"
                    icon="building"
                  />
                </Field>
                <Field label="Tagline" hint="Shows under your name on the review funnel — optional">
                  <Input
                    value={form.tagline}
                    onChange={e => patchForm('tagline', e.target.value)}
                    placeholder="e.g. Wood-fired comfort food since 2019"
                  />
                </Field>
                <Field label="Business type" hint="Used to personalise AI review drafts — auto-filled from your industry">
                  <Input
                    value={form.business_type}
                    onChange={e => patchForm('business_type', e.target.value)}
                    placeholder={ind.label}
                    maxLength={60}
                  />
                </Field>
                <Field label="Review keywords" hint="What should customers mention? Comma-separated — optional">
                  <Input
                    value={form.review_keywords}
                    onChange={e => patchForm('review_keywords', e.target.value)}
                    placeholder={keywordPlaceholder(user.industry)}
                    maxLength={300}
                  />
                </Field>
                <Field label="Owner name">
                  <Input defaultValue={user.full_name || user.email.split('@')[0]} icon="user" />
                </Field>
                <Field label="Account email">
                  <Input defaultValue={user.email} disabled />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 1: Review platforms ──────────────────────── */}
          {step === 1 && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                Where should customers post reviews?
              </h1>
              <p style={{ color: 'var(--lp-fg-muted)', fontSize: 15, margin: '0 0 12px', lineHeight: 1.5 }}>
                Add your review page URLs. Customers are redirected here after giving a high rating.
              </p>

              {/* Industry tip */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'var(--lp-primary-soft, rgba(110,91,255,0.08))', borderRadius: 10, border: '1px solid rgba(110,91,255,0.15)', marginBottom: 24 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                    Recommended for {ind.label}s
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--lp-fg-muted)', lineHeight: 1.5 }}>{ind.tip}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
                {platforms.map(entry => {
                  const def = PLATFORM_DEFS.find(d => d.id === entry.id);
                  if (!def) return null;
                  const isRecommended = ind.platforms.includes(entry.id);
                  return (
                    <div
                      key={entry.id}
                      style={{
                        padding: '12px 16px', borderRadius: 12,
                        border: `1.5px solid ${entry.enabled ? 'var(--lp-primary)' : 'var(--lp-border)'}`,
                        background: entry.enabled ? 'var(--lp-primary-soft, rgba(110,91,255,0.04))' : 'var(--lp-surface)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: entry.enabled ? 10 : 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{def.emoji}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 600, fontSize: 14 }}>{def.name}</span>
                              {isRecommended && (
                                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: 'var(--lp-primary)', color: '#fff', fontWeight: 600 }}>
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                              {def.regionTags.slice(0, 5).map(r => (
                                <span key={r} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--lp-surface-muted, rgba(0,0,0,0.05))', color: 'var(--lp-fg-muted)', fontWeight: 600 }}>{r}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {/* Toggle */}
                          <button
                            onClick={() => setPlatformEnabled(entry.id, !entry.enabled)}
                            style={{
                              width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer',
                              background: entry.enabled ? 'var(--lp-primary)' : 'var(--lp-border)',
                              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                            }}
                          >
                            <div style={{
                              width: 16, height: 16, borderRadius: '50%', background: '#fff',
                              position: 'absolute', top: 3,
                              left: entry.enabled ? 21 : 3,
                              transition: 'left 0.2s',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            }} />
                          </button>
                          {entry.id !== 'google' && (
                            <button
                              onClick={() => removePlatform(entry.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lp-fg-muted)', padding: 2, display: 'flex' }}
                            >
                              <Icon name="x" size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      {entry.enabled && (
                        <Input
                          value={entry.url}
                          onChange={e => setPlatformUrl(entry.id, e.target.value)}
                          placeholder={def.placeholder}
                          icon="link"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Add more platforms */}
                {PLATFORM_DEFS.filter(d => !platforms.find(p => p.id === d.id)).length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--lp-fg-muted)', fontWeight: 600, marginBottom: 8 }}>Add more platforms</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {PLATFORM_DEFS.filter(d => !platforms.find(p => p.id === d.id)).map(def => (
                        <button
                          key={def.id}
                          onClick={() => addPlatform(def.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 8,
                            border: '1px dashed var(--lp-border)',
                            background: 'none', cursor: 'pointer',
                            fontSize: 13, color: 'var(--lp-fg)', fontWeight: 500,
                          }}
                        >
                          <span>{def.emoji}</span>
                          {def.name}
                          <div style={{ display: 'flex', gap: 3 }}>
                            {def.regionTags.slice(0, 3).map(r => (
                              <span key={r} style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'var(--lp-surface-muted, rgba(0,0,0,0.05))', color: 'var(--lp-fg-muted)' }}>{r}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 12, color: 'var(--lp-fg-muted)', margin: '4px 0 0' }}>
                  URLs are optional — you can add them later from Funnel settings.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Branding ──────────────────────────────── */}
          {step === 2 && (
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                Make it yours
              </h1>
              <p style={{ color: 'var(--lp-fg-muted)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.5 }}>
                Your brand color and initials appear on every customer review funnel.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <Field label="Brand color">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                    {BRAND_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => patchForm('color', c)}
                        style={{
                          width: 36, height: 36, borderRadius: 10, border: 'none',
                          background: c, cursor: 'pointer',
                          outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                          outlineOffset: 2,
                          transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                          transition: 'all 0.15s',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--lp-fg-muted)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: form.color }} />
                    Selected: {form.color}
                  </div>
                </Field>
                <Field label="Logo initials" hint="2 letters shown in the funnel header — auto-filled from your name">
                  <Input
                    value={form.initials}
                    maxLength={2}
                    onChange={e => patchForm('initials', e.target.value.toUpperCase())}
                    style={{ width: 90 }}
                    placeholder={autoInitials(form.name) || 'AB'}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── Step 3: Launch ────────────────────────────────── */}
          {step === 3 && (
            <div>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 6px' }}>
                  You&apos;re ready to launch 🚀
                </h1>
                <p style={{ color: 'var(--lp-fg-muted)', fontSize: 15, margin: '0 0 24px', lineHeight: 1.5 }}>
                  Review your setup and go. You can change everything later from the dashboard.
                </p>

                {/* Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Business */}
                  <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--lp-border)', background: 'var(--lp-surface)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lp-fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Business</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                        {form.initials || autoInitials(form.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{form.name}</div>
                        {form.tagline && <div style={{ fontSize: 12, color: 'var(--lp-fg-muted)', marginTop: 2 }}>{form.tagline}</div>}
                        {user.industry && <div style={{ marginTop: 4 }}><Badge tone="neutral">{ind.emoji} {ind.label}</Badge></div>}
                      </div>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--lp-border)', background: 'var(--lp-surface)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lp-fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Review platforms</div>
                    {platforms.filter(p => p.enabled && p.url.trim()).length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--lp-fg-muted)' }}>None set — add later from Funnel settings.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {platforms.filter(p => p.enabled && p.url.trim()).map(p => {
                          const def = PLATFORM_DEFS.find(d => d.id === p.id);
                          return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                              <span>{def?.emoji ?? '⭐'}</span>
                              <span style={{ fontWeight: 500 }}>{def?.name ?? p.id}</span>
                              <Icon name="check" size={12} style={{ color: 'var(--lp-success)', marginLeft: 2 }} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* What happens next */}
                  <div style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid var(--lp-border)', background: 'var(--lp-surface)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lp-fg-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>What happens next</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        'Business profile saved to your account',
                        'A live QR campaign is generated automatically',
                        'Download your QR from the QR Campaigns page',
                        'Place it anywhere — customers scan and review',
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: form.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                            {i + 1}
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#DC2626', fontSize: 13 }}>
                      {error}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ── Fixed bottom navigation ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', background: 'var(--lp-surface)',
        borderTop: '1px solid var(--lp-border)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}>
        <button
          onClick={back}
          disabled={step === 0 || saving || launching}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 8, border: '1px solid var(--lp-border)',
            background: 'none', cursor: step === 0 ? 'not-allowed' : 'pointer',
            fontSize: 14, fontWeight: 500, color: step === 0 ? 'var(--lp-fg-muted)' : 'var(--lp-fg)',
            opacity: step === 0 ? 0.4 : 1,
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {step < STEPS.length - 1 ? (
            <button
              onClick={saveAndNext}
              disabled={!canAdvance() || saving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: canAdvance() ? 'var(--lp-primary)' : 'var(--lp-border)',
                color: canAdvance() ? '#fff' : 'var(--lp-fg-muted)',
                fontSize: 14, fontWeight: 600, cursor: canAdvance() ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              {saving ? 'Saving…' : <>Save &amp; Continue →</>}
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={launching}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 32px', borderRadius: 8, border: 'none',
                background: launching ? 'var(--lp-border)' : 'var(--lp-primary)',
                color: launching ? 'var(--lp-fg-muted)' : '#fff',
                fontSize: 15, fontWeight: 700, cursor: launching ? 'not-allowed' : 'pointer',
                boxShadow: launching ? 'none' : '0 4px 16px rgba(110,91,255,0.35)',
                transition: 'all 0.15s',
              }}
            >
              {launching ? (
                <>
                  <svg width={14} height={14} viewBox="0 0 14 14" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" fill="none" />
                  </svg>
                  Launching…
                </>
              ) : (
                <>🚀 Launch my dashboard</>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
