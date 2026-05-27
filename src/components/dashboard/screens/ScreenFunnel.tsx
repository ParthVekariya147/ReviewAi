'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon, Card, Btn, Stat, Chart, Field, Input, Select, Switch, Tabs, StarRating, Counter, pct } from '../ui';
import { PLATFORM_DEFS, type ReviewPlatformEntry } from '@/lib/platforms';
import { LogoUpload } from '../LogoUpload';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ── types ─────────────────────────────────────────────────────

interface Business {
  id:                    string;
  name:                  string;
  tagline:               string | null;
  google_link:           string | null;
  brand_color:           string;
  logo_initials:         string;
  logo_url?:             string | null;
  min_rating_for_google: number;
  language:              string;
  plan:                  string;
  review_platforms?:     ReviewPlatformEntry[] | null;
  review_keywords?:      string | null;
  business_type?:        string | null;
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

// ── main component ────────────────────────────────────────────

export default function ScreenFunnel({ initialBusiness }: Props) {
  const [tab,        setTab]        = useState('design');
  const [saveState,  setSaveState]  = useState<SaveState>('idle');
  const [logoUrl,    setLogoUrl]    = useState<string | null>(initialBusiness?.logo_url ?? null);
  const [logoToast,  setLogoToast]  = useState<'uploaded' | 'removed' | null>(null);

  function handleLogoUpdate(url: string | null) {
    setLogoUrl(url);
    setLogoToast(url ? 'uploaded' : 'removed');
    setTimeout(() => setLogoToast(null), 2500);
  }

  const { data: overview } = useQuery<{
    kpis: { scans: number; generates: number; copies: number; redirects: number; completes: number; conversion: number };
    daily_series: { date: string; scans: number }[];
  }>({
    queryKey: ['/api/dashboard/overview'],
    queryFn:  () => fetcher('/api/dashboard/overview'),
  });

  const { data: rep } = useQuery<{ avg_rating: number; total_reviews: number }>({
    queryKey: ['/api/businesses/reputation'],
    queryFn:  () => fetcher('/api/businesses/reputation'),
  });

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

  // Local-only switch states (no DB columns)
  const [showHours,      setShowHours]      = useState(true);
  const [showStaff,      setShowStaff]      = useState(false);
  const [discloseAI,     setDiscloseAI]     = useState(true);
  const [capturePrivate, setCapturePrivate] = useState(true);
  const [notify5Star,    setNotify5Star]    = useState(true);
  const [throttleScans,  setThrottleScans]  = useState(true);

  // Talking points — parsed from business.review_keywords (comma-separated)
  const [talkingPoints, setTalkingPoints] = useState<string[]>(() =>
    initialBusiness?.review_keywords
      ? initialBusiness.review_keywords.split(',').map(k => k.trim()).filter(Boolean)
      : []
  );
  const [addingTopic, setAddingTopic] = useState(false);
  const [topicInput,  setTopicInput]  = useState('');

  // Business-level fields that ARE persisted
  const [language,  setLanguage]  = useState(initialBusiness?.language              ?? 'en');
  const [threshold, setThreshold] = useState(initialBusiness?.min_rating_for_google ?? 4);

  // Review platforms — init from saved data or seed with google_link.
  // Back-fill google_link into any existing Google entry whose URL is empty,
  // so a stale empty review_platforms row never shadows a valid google_link.
  const [platforms, setPlatforms] = useState<ReviewPlatformEntry[]>(() => {
    const saved = initialBusiness?.review_platforms;
    const gl    = initialBusiness?.google_link ?? '';
    if (saved && saved.length > 0) {
      return saved.map(p =>
        p.id === 'google' && !p.url && gl ? { ...p, url: gl } : p
      );
    }
    return [{ id: 'google', url: gl, enabled: true }];
  });

  const setFunnelField = (k: string, v: string | number) => setFunnel(f => ({ ...f, [k]: v }));

  // Ensure URLs have a protocol so sanitizeUrl on the server doesn't strip them.
  // 'www.google.com' → 'https://www.google.com', already-valid URLs are untouched.
  function normalizeUrl(u: string): string {
    if (!u) return u;
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `https://${u}`;
  }

  async function publish() {
    setSaveState('saving');
    // Normalize all platform URLs before sending, and update local state so
    // the input reflects the corrected value (e.g. adds https://) after publish.
    const normalizedPlatforms = platforms.map(p => ({ ...p, url: normalizeUrl(p.url) }));
    setPlatforms(normalizedPlatforms);
    const googleUrl = normalizedPlatforms.find(p => p.id === 'google')?.url ?? null;
    const ok = await patchBusiness({
      language,
      min_rating_for_google: threshold,
      review_platforms:      normalizedPlatforms,
      review_keywords:       talkingPoints.join(', ') || null,
      google_link:           googleUrl || null,
    });
    setSaveState(ok ? 'saved' : 'error');
    if (ok) setTimeout(() => setSaveState('idle'), 2500);
  }

  function addTalkingPoint() {
    const v = topicInput.trim();
    if (v && !talkingPoints.includes(v)) {
      setTalkingPoints(ps => [...ps, v]);
      setSaveState('idle');
    }
    setTopicInput('');
    setAddingTopic(false);
  }

  function removeTalkingPoint(p: string) {
    setTalkingPoints(ps => ps.filter(x => x !== p));
    setSaveState('idle');
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
            <Btn variant="primary" icon="check" onClick={publish}>{publishLabel}</Btn>
          </>
        }
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                <Field label="Logo">
                  <LogoUpload currentLogoUrl={logoUrl} onSuccess={handleLogoUpdate} />
                  {logoToast && (
                    <span style={{
                      display: 'inline-block', marginTop: 6,
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: logoToast === 'uploaded' ? '#dcfce7' : 'var(--lp-surface-muted)',
                      color:      logoToast === 'uploaded' ? '#16a34a' : 'var(--lp-fg-muted)',
                    }}>
                      {logoToast === 'uploaded' ? '✓ Logo uploaded' : 'Logo removed'}
                    </span>
                  )}
                </Field>
              </div>
              <Switch label="Show business hours & address" sub="Helps customer recall the visit" checked={showHours} onChange={setShowHours} />
              <Switch label="Show staff signature" sub="Personalize with the staff member's name" checked={showStaff} onChange={setShowStaff} />
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
                  {talkingPoints.map(c => (
                    <span className="lp-chip" key={c} onClick={() => removeTalkingPoint(c)} style={{ cursor: 'pointer' }}>
                      {c} <Icon name="x" size={11} />
                    </span>
                  ))}
                  {addingTopic ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Input
                        value={topicInput}
                        onChange={e => setTopicInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') addTalkingPoint();
                          if (e.key === 'Escape') { setAddingTopic(false); setTopicInput(''); }
                        }}
                        placeholder="e.g. great coffee"
                        style={{ width: 140, height: 28, fontSize: 12 }}
                        autoFocus
                      />
                      <button className="lp-chip lp-chip-add" onClick={addTalkingPoint}><Icon name="check" size={11} /></button>
                    </span>
                  ) : (
                    <button className="lp-chip lp-chip-add" onClick={() => setAddingTopic(true)}><Icon name="plus" size={11} /> Add topic</button>
                  )}
                </div>
              </Field>
              <Switch label="Disclose AI assistance to customers" sub="Recommended for Google policy compliance" checked={discloseAI} onChange={setDiscloseAI} />
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

              <Switch label="Capture low ratings privately" sub="Below-threshold customers send feedback directly to you" checked={capturePrivate} onChange={setCapturePrivate} />
              <Switch label="Notify owner on every 5★ review" sub="Push notifications and email" checked={notify5Star} onChange={setNotify5Star} />
              <Switch label="Throttle repeat scans" sub="One review per customer device per 30 days" checked={throttleScans} onChange={setThrottleScans} />
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

      </div>
    </div>
  );
}
