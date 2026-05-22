'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Chart, Field, Input, Select, Switch, Tabs, StarRating, Counter, dayLabels, pct } from '../ui';
import { PLATFORM_DEFS, type ReviewPlatformEntry } from '@/lib/platforms';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ── types ─────────────────────────────────────────────────────

interface Business {
  id:                    string;
  name:                  string;
  tagline:               string | null;
  google_link:           string | null;
  brand_color:           string;
  logo_initials:         string;
  min_rating_for_google: number;
  language:              string;
  plan:                  string;
  review_platforms?:     ReviewPlatformEntry[] | null;
}

interface UserInfo { id: string; email: string; full_name: string }

interface Props {
  initialBusiness: Business | null;
  user:            UserInfo;
}

// ── helpers ───────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

async function patchBusiness(updates: Record<string, unknown>): Promise<boolean> {
  const res = await fetch('/api/businesses', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(updates),
  });
  return res.ok;
}

const LANGUAGES = [
  { value: 'en', label: 'English'    },
  { value: 'es', label: 'Spanish'    },
  { value: 'fr', label: 'French'     },
  { value: 'de', label: 'German'     },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian'    },
  { value: 'ja', label: 'Japanese'   },
];

// ── sub-components ────────────────────────────────────────────

function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="lp-page-hd">
      <div>
        <h1 className="lp-h1">{title}</h1>
        {sub && <div className="lp-page-sub">{sub}</div>}
      </div>
      {actions && <div className="lp-page-act">{actions}</div>}
    </div>
  );
}

interface FunnelState {
  style?:       string;
  heading?:     string;
  sub?:         string;
  tone?:        string;
  language?:    string;
  threshold?:   number;
  reviewCount?: number;
}

type StyleEntry = { bg: string; fg: string; accent: string; font: string };

function FunnelMockup({ brand, step = 'landing', funnel = {} }: {
  brand: { name: string; color: string; initials: string };
  step?: string;
  funnel?: FunnelState;
}) {
  const style   = funnel.style   || 'elegant';
  const heading = funnel.heading || `Thanks for visiting ${brand.name}!`;
  const sub     = funnel.sub     || "We'd love to hear about your experience.";

  const styleVars: Record<string, StyleEntry> = {
    elegant: { bg: '#FAFAF7', fg: '#0F0F12', accent: brand.color, font: 'ui-serif, Georgia, serif' },
    vivid:   { bg: `linear-gradient(160deg, ${brand.color} 0%, #8B5CF6 100%)`, fg: '#fff', accent: '#fff', font: 'system-ui' },
    minimal: { bg: '#FFFFFF', fg: '#000', accent: '#000', font: 'system-ui' },
    playful: { bg: '#FFF6E8', fg: '#3F2E1B', accent: brand.color, font: 'system-ui' },
  };

  const sv       = styleVars[style] || styleVars.elegant;
  const isGrad   = sv.bg.includes('gradient');
  const btnColor = isGrad ? brand.color : '#fff';
  const logoText = brand.initials || brand.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || '??';

  return (
    <div className="lp-funnel" style={{ background: sv.bg, color: sv.fg, fontFamily: sv.font }}>
      <div className="lp-funnel-head">
        <div className="lp-funnel-logo" style={{ background: sv.accent, color: btnColor }}>
          {logoText}
        </div>
        <div className="lp-funnel-biz">{brand.name || 'Your Business'}</div>
      </div>
      {step === 'landing' && (
        <div className="lp-funnel-body">
          <div className="lp-funnel-h">{heading}</div>
          <div className="lp-funnel-sub">{sub}</div>
          <div className="lp-funnel-stars-prompt">
            {[1,2,3,4,5].map(i => <span key={i} className="lp-funnel-star-prompt">★</span>)}
          </div>
          <div className="lp-funnel-cta" style={{ background: sv.accent, color: btnColor }}>Rate your visit</div>
        </div>
      )}
      {step === 'rate' && (
        <div className="lp-funnel-body">
          <div className="lp-funnel-h" style={{ fontSize: 18 }}>How was it?</div>
          <div className="lp-funnel-stars-big">
            {[1,2,3,4,5].map(i => <span key={i} className="lp-funnel-star-big" style={{ color: '#F5A623' }}>★</span>)}
          </div>
          <div className="lp-funnel-sub">5 out of 5 — wonderful!</div>
          <div className="lp-funnel-cta" style={{ background: sv.accent, color: btnColor }}>Continue</div>
        </div>
      )}
      {step === 'generate' && (
        <div className="lp-funnel-body" style={{ paddingTop: 14 }}>
          <div className="lp-funnel-h" style={{ fontSize: 16 }}>Pick what fits your visit</div>
          {[
            'The wood-fired pizza was incredible and the staff made our anniversary feel special. Will be back soon!',
            'Cozy atmosphere, fast service and the vegan menu was a delightful surprise. Highly recommend.',
            'Best Italian in NW Portland — every dish was wonderful and the patio is a vibe at sunset.',
          ].map((r, i) => (
            <div className="lp-funnel-review" key={i} style={{ borderColor: i === 1 ? sv.accent : 'rgba(0,0,0,0.08)' }}>
              <div className="lp-funnel-review-text">{r}</div>
              <div className="lp-funnel-review-acts">
                <span><Icon name="refresh" size={11}/> Refresh</span>
                <span><Icon name="copy" size={11}/> Copy</span>
              </div>
            </div>
          ))}
          <div className="lp-funnel-cta" style={{ background: sv.accent, color: btnColor }}>Post to Google</div>
        </div>
      )}
      {step === 'redirect' && (
        <div className="lp-funnel-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div className="lp-funnel-redirect-icon"><Icon name="external" size={24}/></div>
          <div className="lp-funnel-h" style={{ fontSize: 18 }}>Opening Google…</div>
          <div className="lp-funnel-sub">Paste your review and hit Post. Thanks!</div>
          <div className="lp-google-card">
            <div className="lp-google-g">G</div>
            <div>
              <div style={{ fontWeight: 600 }}>{brand.name || 'Your Business'}</div>
              <div className="lp-muted" style={{ fontSize: 11 }}>Write a review</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────

export default function ScreenFunnel({ initialBusiness, user: _user }: Props) {
  const [tab,        setTab]        = useState('design');
  const [simStep,    setSimStep]    = useState('landing');
  const [simRunning, setSimRunning] = useState(false);
  const [saveState,  setSaveState]  = useState<SaveState>('idle');

  const { data: overview } = useSWR<{
    kpis: { scans: number; generates: number; copies: number; redirects: number; completes: number; conversion: number };
    daily_series: { date: string; scans: number }[];
  }>('/api/dashboard/overview', fetcher);

  const { data: rep } = useSWR<{ avg_rating: number; total_reviews: number }>(
    '/api/businesses/reputation', fetcher
  );

  const kpis = overview?.kpis;
  const funnelSteps = kpis ? [
    kpis.scans,
    kpis.generates,
    kpis.copies,
    kpis.redirects,
    kpis.completes,
  ] : null;

  // Local-only funnel presentation state (not yet persisted to DB)
  const [funnel, setFunnel] = useState({
    style:       'elegant',
    heading:     initialBusiness?.name ? `Thanks for visiting ${initialBusiness.name}!` : 'Thanks for visiting!',
    sub:         "We'd love to hear about your experience.",
    tone:        'warm',
    reviewCount: 3,
  });

  // Business-level fields that ARE persisted
  const [language,  setLanguage]  = useState(initialBusiness?.language              ?? 'en');
  const [threshold, setThreshold] = useState(initialBusiness?.min_rating_for_google ?? 4);

  // Review platforms — init from saved data or seed with google_link
  const [platforms, setPlatforms] = useState<ReviewPlatformEntry[]>(() => {
    const saved = initialBusiness?.review_platforms;
    if (saved && saved.length > 0) return saved;
    return [{ id: 'google', url: initialBusiness?.google_link ?? '', enabled: true }];
  });

  const brand = {
    name:     initialBusiness?.name         ?? '',
    color:    initialBusiness?.brand_color  ?? '#6E5BFF',
    initials: initialBusiness?.logo_initials ?? '',
  };

  useEffect(() => {
    if (!simRunning) return;
    const steps = ['landing', 'rate', 'generate', 'redirect'];
    const i  = steps.indexOf(simStep);
    const id = setTimeout(() => {
      const ni = (i + 1) % steps.length;
      setSimStep(steps[ni]);
      if (ni === 0) setSimRunning(false);
    }, 1900);
    return () => clearTimeout(id);
  }, [simRunning, simStep]);

  const setFunnelField = (k: string, v: string | number) => setFunnel(f => ({ ...f, [k]: v }));

  async function publish() {
    setSaveState('saving');
    const ok = await patchBusiness({
      language,
      min_rating_for_google: threshold,
      review_platforms:      platforms,
      // keep google_link in sync with first google entry for backward compat
      google_link: platforms.find(p => p.id === 'google')?.url ?? null,
    });
    setSaveState(ok ? 'saved' : 'error');
    if (ok) setTimeout(() => setSaveState('idle'), 2500);
  }

  // Platform helpers
  function setPlatformEnabled(id: string, enabled: boolean) {
    setPlatforms(ps => ps.map(p => p.id === id ? { ...p, enabled } : p));
    setSaveState('idle');
  }
  function setPlatformUrl(id: string, url: string) {
    setPlatforms(ps => ps.map(p => p.id === id ? { ...p, url } : p));
    setSaveState('idle');
  }
  function addPlatform(id: string) {
    if (platforms.find(p => p.id === id)) return;
    setPlatforms(ps => [...ps, { id, url: '', enabled: true }]);
    setSaveState('idle');
  }
  function removePlatform(id: string) {
    setPlatforms(ps => ps.filter(p => p.id !== id));
    setSaveState('idle');
  }

  const publishLabel =
    saveState === 'saving' ? 'Saving…' :
    saveState === 'saved'  ? 'Published!' :
    saveState === 'error'  ? 'Error' : 'Publish changes';

  return (
    <div className="lp-page">
      <PageHeader
        title="Customer review funnel"
        sub="Design what customers see after they scan your QR code"
        actions={
          <>
            <Btn icon="eye" onClick={() => { setSimRunning(true); setSimStep('landing'); }}>Preview</Btn>
            <Btn variant="primary" icon="check" onClick={publish}>{publishLabel}</Btn>
          </>
        }
      />
      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 16, alignItems: 'start' }}>
        <Card>
          <Tabs value={tab} onChange={setTab} tabs={[
            { value: 'design',    label: 'Design'          },
            { value: 'flow',      label: 'Customer flow'   },
            { value: 'ai',        label: 'AI tone & language' },
            { value: 'rules',     label: 'Routing rules'   },
            { value: 'analytics', label: 'Conversion'      },
          ]} />

          {tab === 'design' && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <Field label="Funnel style">
                <div className="lp-grid lp-grid-4" style={{ gap: 10 }}>
                  {['elegant','vivid','minimal','playful'].map(s => (
                    <button key={s} onClick={() => setFunnelField('style', s)}
                            className={`lp-funnel-pick ${funnel.style === s ? 'is-on' : ''}`} style={{ padding: 10 }}>
                      <div className={`lp-funnel-mini lp-funnel-mini-${s}`} style={{ height: 80 }}>
                        <div className="lp-funnel-mini-logo"/>
                        <div className="lp-funnel-mini-bar"/>
                        <div className="lp-funnel-mini-btn"/>
                      </div>
                      <div className="lp-pick-title" style={{ marginTop: 8, fontSize: 12, textTransform: 'capitalize' }}>{s}</div>
                    </button>
                  ))}
                </div>
              </Field>
              <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
                <Field label="Headline">
                  <Input value={funnel.heading} onChange={e => setFunnelField('heading', e.target.value)} />
                </Field>
                <Field label="Sub-headline">
                  <Input value={funnel.sub} onChange={e => setFunnelField('sub', e.target.value)} />
                </Field>
                <Field label="Primary CTA"><Input defaultValue="Rate your visit" /></Field>
                <Field label="Logo"><Input defaultValue="logo.svg" icon="upload" /></Field>
              </div>
              <Switch label="Show business hours & address" sub="Helps customer recall the visit" checked={true} onChange={() => {}} />
              <Switch label="Show staff signature" sub="Personalize with the staff member's name" checked={false} onChange={() => {}} />
            </div>
          )}

          {tab === 'flow' && (
            <div style={{ marginTop: 16 }}>
              <div className="lp-flow-canvas">
                {['Scan QR','Rate visit','AI suggests review','Customer edits/refreshes','Redirect to Google'].map((s, i, arr) => {
                  const steps = funnelSteps ?? [0, 0, 0, 0, 0];
                  const top   = steps[0] || 1;
                  const count = steps[i] ?? 0;
                  const prev  = steps[i - 1] ?? top;
                  return (
                    <div key={s} style={{ display: 'contents' }}>
                      <div className={`lp-flow-node ${i === 2 ? 'is-accent' : ''}`}>
                        <div className="lp-flow-num">{i + 1}</div>
                        <div className="lp-flow-name">{s}</div>
                        <div className="lp-flow-stat">
                          <Counter value={count} />
                          <span className="lp-muted"> · {pct(count / top)}</span>
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="lp-flow-arrow">
                          <Icon name="chevron" size={16} />
                          <div className="lp-flow-drop">
                            {prev > 0 ? `−${Math.round((1 - count / prev) * 100)}%` : '—'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="lp-callout" style={{ marginTop: 16 }}>
                <Icon name="sparkles" size={16} />
                <div>
                  <div><b>Optimization tip</b> — Add a &quot;skip writing, use suggestion&quot; CTA between steps 3 &amp; 4</div>
                  <div className="lp-muted">Could lift conversion by ~6% based on similar restaurants.</div>
                </div>
                <Btn variant="ghost" size="sm">Apply</Btn>
              </div>
            </div>
          )}

          {tab === 'ai' && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <Field label="Default tone preset">
                <div className="lp-grid lp-grid-4" style={{ gap: 8 }}>
                  {['warm','professional','casual','enthusiastic'].map(p => (
                    <button key={p} onClick={() => setFunnelField('tone', p)}
                            className={`lp-tone-pick ${funnel.tone === p ? 'is-on' : ''}`}>
                      <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p}</div>
                      <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>
                        {({'warm':'Inviting & friendly','professional':'Polished tone','casual':'Conversational','enthusiastic':'Energetic & glowing'} as Record<string, string>)[p]}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Default language" hint="Saved to your business record">
                <Select value={language} onChange={v => { setLanguage(v); setSaveState('idle'); }} options={LANGUAGES} />
              </Field>
              <Field label="Number of AI suggestions per customer" hint="More options means higher copy rate but more compute usage">
                <div className="lp-stepper">
                  <button onClick={() => setFunnelField('reviewCount', Math.max(1, funnel.reviewCount - 1))}>−</button>
                  <span><b>{funnel.reviewCount}</b> suggestions</span>
                  <button onClick={() => setFunnelField('reviewCount', Math.min(5, funnel.reviewCount + 1))}>+</button>
                </div>
              </Field>
              <Field label="Suggested talking points" hint="Topics to weave into AI suggestions">
                <div className="lp-chips">
                  {['wood-fired oven','neighborhood vibe','vegan options','service speed','patio seating'].map(c => (
                    <span className="lp-chip" key={c}>{c} <Icon name="x" size={11} /></span>
                  ))}
                  <button className="lp-chip lp-chip-add"><Icon name="plus" size={11} /> Add topic</button>
                </div>
              </Field>
              <Switch label="Disclose AI assistance to customers" sub="Recommended for Google policy compliance" checked={true} onChange={() => {}} />
            </div>
          )}

          {tab === 'rules' && (
            <div className="lp-stack" style={{ marginTop: 16 }}>

              {/* ── Star threshold ── */}
              <Field label="Star threshold for redirect" hint="Customers below this rating see a private feedback form instead">
                <div className="lp-thresh">
                  <StarRating value={threshold} onChange={v => { setThreshold(v); setSaveState('idle'); }} size={26} />
                  <span className="lp-muted">≥ {threshold} stars → review platform</span>
                </div>
              </Field>

              {/* ── Platform manager ── */}
              <Field label="Review platforms" hint="Enable the platforms you want customers redirected to after rating">
                <div className="lp-stack" style={{ gap: 8, marginTop: 4 }}>

                  {/* Active / configured platforms */}
                  {platforms.map(entry => {
                    const def = PLATFORM_DEFS.find(d => d.id === entry.id);
                    if (!def) return null;
                    return (
                      <div key={entry.id} className="lp-stack" style={{ gap: 6, padding: '10px 12px', background: 'var(--lp-surface-raised)', borderRadius: 8, border: '1px solid var(--lp-border)' }}>
                        <div className="lp-flex lp-flex-between" style={{ alignItems: 'center' }}>
                          <div className="lp-flex" style={{ gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 20 }}>{def.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{def.name}</div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 2, flexWrap: 'wrap' }}>
                                {def.regionTags.map(r => (
                                  <span key={r} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'var(--lp-surface-muted)', color: 'var(--lp-fg-muted)', fontWeight: 600 }}>{r}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="lp-flex" style={{ gap: 8, alignItems: 'center' }}>
                            <Switch checked={entry.enabled} onChange={v => setPlatformEnabled(entry.id, v)} />
                            {entry.id !== 'google' && (
                              <button onClick={() => removePlatform(entry.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lp-fg-muted)', padding: 2 }}>
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

                  {/* Add platform picker */}
                  {PLATFORM_DEFS.filter(d => !platforms.find(p => p.id === d.id)).length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--lp-fg-muted)', fontWeight: 600, marginBottom: 8, marginTop: 4 }}>Add platform</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {PLATFORM_DEFS.filter(d => !platforms.find(p => p.id === d.id)).map(def => (
                          <button
                            key={def.id}
                            onClick={() => addPlatform(def.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '5px 10px', borderRadius: 6, border: '1px dashed var(--lp-border)',
                              background: 'none', cursor: 'pointer', fontSize: 12,
                              color: 'var(--lp-fg)', fontWeight: 500,
                            }}
                          >
                            <span>{def.emoji}</span>
                            {def.name}
                            <div style={{ display: 'flex', gap: 3 }}>
                              {def.regionTags.slice(0, 3).map(r => (
                                <span key={r} style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'var(--lp-surface-muted)', color: 'var(--lp-fg-muted)' }}>{r}</span>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Field>

              <Switch label="Capture low ratings privately" sub="Below-threshold customers send feedback directly to you" checked={true} onChange={() => {}} />
              <Switch label="Notify owner on every 5★ review" sub="Push notifications and email" checked={true} onChange={() => {}} />
              <Switch label="Throttle repeat scans" sub="One review per customer device per 30 days" checked={true} onChange={() => {}} />
            </div>
          )}

          {tab === 'analytics' && (
            <div style={{ marginTop: 16 }}>
              <div className="lp-grid lp-grid-4" style={{ marginBottom: 14 }}>
                <Stat label="Funnel starts" icon="qr"   value={kpis?.scans    ?? 0} tone="primary" />
                <Stat label="Completions"   icon="check" value={kpis?.completes ?? 0} tone="success" />
                <Stat label="Avg. rating"   icon="star"  value={rep?.avg_rating ?? 0} decimals={1} tone="warning" />
                <Stat label="Conversion"    icon="trendUp" value={kpis?.conversion ?? 0} suffix="%" decimals={1} tone="violet" />
              </div>
              <Chart
                data={(overview?.daily_series ?? []).map(d => ({ x: d.date.slice(5), y: d.scans }))}
                keys={['y']} colors={['primary']} kind="area" height={220}
              />
            </div>
          )}
        </Card>

        <div className="lp-stack" style={{ position: 'sticky', top: 12 }}>
          <Card>
            <CardHeader
              title="Live preview"
              subtitle={`Customer view — ${simStep}`}
              action={
                <Btn variant="primary" size="sm" icon={simRunning ? 'x' : 'play'}
                     onClick={() => { setSimRunning(r => !r); if (!simRunning) setSimStep('landing'); }}>
                  {simRunning ? 'Stop' : 'Simulate'}
                </Btn>
              }
            />
            <div className="lp-phone" style={{ margin: '0 auto' }}>
              <FunnelMockup brand={brand} step={simStep} funnel={{ ...funnel, language, threshold }} />
            </div>
            <div className="lp-flex" style={{ gap: 6, marginTop: 14, justifyContent: 'center' }}>
              {['landing','rate','generate','redirect'].map(s => (
                <button key={s} className={`lp-step-dot ${simStep === s ? 'is-on' : ''}`} onClick={() => setSimStep(s)}>
                  {s}
                </button>
              ))}
            </div>
          </Card>

          {initialBusiness && (
            <Card>
              <CardHeader title="Brand" subtitle="From business profile" />
              <div className="lp-flex" style={{ gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: brand.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  {brand.initials || brand.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{brand.name}</div>
                  <div className="lp-muted" style={{ fontSize: 11 }}>{brand.color}</div>
                </div>
                <span style={{ marginLeft: 'auto' }}>
                  <Badge tone={initialBusiness.plan === 'pro' ? 'primary' : initialBusiness.plan === 'enterprise' ? 'success' : 'neutral'}>
                    {initialBusiness.plan}
                  </Badge>
                </span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
