'use client';

import { useState, useEffect } from 'react';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Chart, Field, Input, Select, Switch, Tabs, StarRating, Counter, dayLabels, pct } from '../ui';

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
  style?: string;
  heading?: string;
  sub?: string;
  tone?: string;
  language?: string;
  threshold?: number;
  reviewCount?: number;
}

type StyleEntry = { bg: string; fg: string; accent: string; font: string };

function FunnelMockup({ brand, step = 'landing', funnel = {} }: { brand: { name: string; color?: string }; step?: string; funnel?: FunnelState }) {
  const style = funnel.style || 'elegant';
  const heading = funnel.heading || `Thanks for visiting ${brand.name}!`;
  const sub = funnel.sub || "We'd love to hear about your experience.";
  const styleVars: Record<string, StyleEntry> = {
    elegant: { bg: '#FAFAF7', fg: '#0F0F12', accent: brand.color || '#6366F1', font: 'ui-serif, Georgia, serif' },
    vivid:   { bg: `linear-gradient(160deg, ${brand.color || '#6366F1'} 0%, #8B5CF6 100%)`, fg: '#fff', accent: '#fff', font: 'system-ui' },
    minimal: { bg: '#FFFFFF', fg: '#000', accent: '#000', font: 'system-ui' },
    playful: { bg: '#FFF6E8', fg: '#3F2E1B', accent: brand.color || '#6366F1', font: 'system-ui' },
  };
  const sv = styleVars[style] || styleVars.elegant;
  const isGrad = sv.bg.includes('gradient');
  const btnColor = isGrad ? brand.color : '#fff';

  return (
    <div className="lp-funnel" style={{ background: sv.bg, color: sv.fg, fontFamily: sv.font }}>
      <div className="lp-funnel-head">
        <div className="lp-funnel-logo" style={{ background: sv.accent, color: btnColor }}>
          {(brand.name || 'B').split(' ').map((s: string) => s[0]).slice(0, 2).join('')}
        </div>
        <div className="lp-funnel-biz">{brand.name}</div>
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
              <div style={{ fontWeight: 600 }}>{brand.name}</div>
              <div className="lp-muted" style={{ fontSize: 11 }}>Write a review</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreenFunnel() {
  const [tab, setTab] = useState('design');
  const [simStep, setSimStep] = useState('landing');
  const [simRunning, setSimRunning] = useState(false);
  const [funnel, setFunnel] = useState({
    style: 'elegant', heading: 'Thanks for visiting!',
    sub: "We'd love to hear about your experience.",
    tone: 'warm', language: 'english', threshold: 4, reviewCount: 3,
  });

  const brand = { name: 'Olive & Pine Bistro', color: '#6366F1' };

  useEffect(() => {
    if (!simRunning) return;
    const steps = ['landing', 'rate', 'generate', 'redirect'];
    const i = steps.indexOf(simStep);
    const id = setTimeout(() => {
      const ni = (i + 1) % steps.length;
      setSimStep(steps[ni]);
      if (ni === 0) setSimRunning(false);
    }, 1900);
    return () => clearTimeout(id);
  }, [simRunning, simStep]);

  const set = (k: string, v: string | number) => setFunnel(f => ({ ...f, [k]: v }));

  return (
    <div className="lp-page">
      <PageHeader
        title="Customer review funnel"
        sub="Design what customers see after they scan your QR code"
        actions={
          <>
            <Btn icon="eye">Preview</Btn>
            <Btn variant="primary" icon="check">Publish changes</Btn>
          </>
        }
      />
      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 16, alignItems: 'start' }}>
        <Card>
          <Tabs value={tab} onChange={setTab} tabs={[
            {value:'design',label:'Design'},
            {value:'flow',label:'Customer flow'},
            {value:'ai',label:'AI tone & language'},
            {value:'rules',label:'Routing rules'},
            {value:'analytics',label:'Conversion'},
          ]}/>

          {tab === 'design' && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <Field label="Funnel style">
                <div className="lp-grid lp-grid-4" style={{ gap: 10 }}>
                  {['elegant','vivid','minimal','playful'].map(s => (
                    <button key={s} onClick={() => set('style', s)}
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
                <Field label="Headline"><Input value={funnel.heading} onChange={(e) => set('heading', e.target.value)}/></Field>
                <Field label="Sub-headline"><Input value={funnel.sub} onChange={(e) => set('sub', e.target.value)}/></Field>
                <Field label="Primary CTA"><Input defaultValue="Rate your visit"/></Field>
                <Field label="Logo"><Input defaultValue="logo.svg" icon="upload"/></Field>
              </div>
              <Switch label="Show business hours & address" sub="Helps customer recall the visit" checked={true} onChange={() => {}}/>
              <Switch label="Show staff signature" sub="Personalize with the staff member's name" checked={false} onChange={() => {}}/>
            </div>
          )}

          {tab === 'flow' && (
            <div style={{ marginTop: 16 }}>
              <div className="lp-flow-canvas">
                {['Scan QR','Rate visit','AI suggests review','Customer edits/refreshes','Redirect to Google'].map((s, i, arr) => (
                  <div key={s} style={{ display: 'contents' }}>
                    <div className={`lp-flow-node ${i === 2 ? 'is-accent' : ''}`}>
                      <div className="lp-flow-num">{i + 1}</div>
                      <div className="lp-flow-name">{s}</div>
                      <div className="lp-flow-stat">
                        <Counter value={[3420,2987,2455,2128,1845][i]}/>
                        <span className="lp-muted"> · {pct([1, 2987/3420, 2455/3420, 2128/3420, 1845/3420][i])}</span>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="lp-flow-arrow">
                        <Icon name="chevron" size={16}/>
                        <div className="lp-flow-drop">
                          −{Math.round((1 - [2987/3420, 2455/2987, 2128/2455, 1845/2128][i]) * 100)}%
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="lp-callout" style={{ marginTop: 16 }}>
                <Icon name="sparkles" size={16}/>
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
                    <button key={p} onClick={() => set('tone', p)}
                            className={`lp-tone-pick ${funnel.tone === p ? 'is-on' : ''}`}>
                      <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p}</div>
                      <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>
                        {({'warm':'Inviting & friendly','professional':'Polished tone','casual':'Conversational','enthusiastic':'Energetic & glowing'} as Record<string, string>)[p]}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Default language">
                <Select value={funnel.language} onChange={(v) => set('language', v)}
                        options={['english','spanish','french','german','portuguese','italian','japanese']}/>
              </Field>
              <Field label="Number of AI suggestions per customer" hint="More options means higher copy rate but more compute usage">
                <div className="lp-stepper">
                  <button onClick={() => set('reviewCount', Math.max(1, funnel.reviewCount - 1))}>−</button>
                  <span><b>{funnel.reviewCount}</b> suggestions</span>
                  <button onClick={() => set('reviewCount', Math.min(5, funnel.reviewCount + 1))}>+</button>
                </div>
              </Field>
              <Field label="Suggested talking points" hint="Topics to weave into AI suggestions">
                <div className="lp-chips">
                  {['wood-fired oven','neighborhood vibe','vegan options','service speed','patio seating'].map(c => (
                    <span className="lp-chip" key={c}>{c} <Icon name="x" size={11}/></span>
                  ))}
                  <button className="lp-chip lp-chip-add"><Icon name="plus" size={11}/> Add topic</button>
                </div>
              </Field>
              <Switch label="Disclose AI assistance to customers" sub="Recommended for Google policy compliance" checked={true} onChange={() => {}}/>
            </div>
          )}

          {tab === 'rules' && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <Field label="QR destination" hint="Where every QR code routes to before the funnel renders">
                <div className="lp-grid lp-grid-2" style={{ gap: 10 }}>
                  <div className="lp-pick is-on lp-pick-h" style={{ cursor: 'default' }}>
                    <span className="lp-pick-icon"><Icon name="link" size={18}/></span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div className="lp-pick-title">reevo.io/r/<b>op-2k4</b></div>
                      <div className="lp-pick-sub">Active for all live campaigns</div>
                    </div>
                    <Badge tone="success" dot>Live</Badge>
                  </div>
                  <div className="lp-pick lp-pick-h" style={{ cursor: 'default' }}>
                    <span className="lp-pick-icon"><Icon name="globe" size={18}/></span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div className="lp-pick-title">reviews.oliveandpine.co</div>
                      <div className="lp-pick-sub">Custom domain · DNS verified</div>
                    </div>
                    <Badge tone="primary">CNAME</Badge>
                  </div>
                </div>
              </Field>
              <Field label="Star threshold for Google redirect" hint="Customers below this rating see a private feedback form instead">
                <div className="lp-thresh">
                  <StarRating value={funnel.threshold} onChange={(v) => set('threshold', v)} size={26}/>
                  <span className="lp-muted">≥ {funnel.threshold} stars → Google</span>
                </div>
              </Field>
              <Switch label="Capture low ratings privately" sub="Below-threshold customers send feedback directly to the business owner" checked={true} onChange={() => {}}/>
              <Switch label="Notify owner on every 5★ review" sub="Push notifications and email" checked={true} onChange={() => {}}/>
              <Switch label="Throttle repeat scans" sub="One review per customer device per 30 days" checked={true} onChange={() => {}}/>
            </div>
          )}

          {tab === 'analytics' && (
            <div style={{ marginTop: 16 }}>
              <div className="lp-grid lp-grid-4" style={{ marginBottom: 14 }}>
                <Stat label="Funnel starts" icon="qr"      value={3420} delta={11}  tone="primary"/>
                <Stat label="Completion"    icon="check"   value={53.9} suffix="%" decimals={1} delta={4.2} tone="success"/>
                <Stat label="Avg. rating"   icon="star"    value={4.6}  decimals={1} delta={0.3} tone="warning"/>
                <Stat label="Time on page"  icon="history" value={48}   suffix="s" delta={-3} tone="violet"/>
              </div>
              <Chart
                data={dayLabels(14).map((x, i) => ({ x, conv: 35 + Math.sin(i * 0.6) * 5 + i * 0.8, target: 50 }))}
                keys={['conv','target']} colors={['primary','violet']} kind="line" height={220}
                formatY={(v) => `${Math.round(v)}%`}
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
              <FunnelMockup brand={brand} step={simStep} funnel={funnel}/>
            </div>
            <div className="lp-flex" style={{ gap: 6, marginTop: 14, justifyContent: 'center' }}>
              {['landing','rate','generate','redirect'].map(s => (
                <button key={s} className={`lp-step-dot ${simStep === s ? 'is-on' : ''}`} onClick={() => setSimStep(s)}>
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
