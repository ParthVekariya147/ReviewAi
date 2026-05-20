'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, Card, Btn, Badge, Field, Input } from '../ui';

const BASE = '/app/business_dashboard';

const STEPS = [
  {key:'details',  label:'Business details', icon:'building'},
  {key:'industry', label:'Industry',          icon:'shop'},
  {key:'google',   label:'Google review',     icon:'link'},
  {key:'brand',    label:'Branding',          icon:'sparkles'},
  {key:'qr',       label:'QR request',        icon:'qr'},
  {key:'funnel',   label:'Funnel',            icon:'funnel'},
  {key:'plan',     label:'Choose plan',       icon:'card'},
];

export default function ScreenOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: 'Olive & Pine Bistro', industry: 'Restaurant',
    address: '1245 Northbound Ave, Portland OR',
    googleUrl: 'https://g.page/r/oliveandpine/review',
    primary: '#6366F1', plan: 'pro', funnelStyle: 'elegant',
  });
  const set = (k: string, v: string) => setData(d => ({...d, [k]: v}));
  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="lp-page lp-onboarding">
      <div className="lp-onb-stepper">
        {STEPS.map((s, i) => (
          <button key={s.key} className={`lp-onb-step ${i === step ? 'is-on' : ''} ${i < step ? 'is-done' : ''}`} onClick={() => setStep(i)}>
            <span className="lp-onb-step-num">
              {i < step ? <Icon name="check" size={14}/> : i + 1}
            </span>
            <div className="lp-onb-step-text">
              <div className="lp-onb-step-label">{s.label}</div>
              <div className="lp-onb-step-sub">Step {i + 1}</div>
            </div>
          </button>
        ))}
      </div>

      <Card className="lp-onb-card">
        <div className="lp-onb-progress">
          <div className="lp-onb-progress-bar" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}/>
        </div>
        <div className="lp-onb-body">
          {step === 0 && (
            <div>
              <h2 className="lp-h2">Tell us about your business</h2>
              <p className="lp-page-sub">We&apos;ll use these details to personalize your customer review funnel.</p>
              <div className="lp-grid lp-grid-2" style={{ marginTop: 22 }}>
                <Field label="Business name"><Input value={data.name} onChange={(e) => set('name', e.target.value)} icon="building"/></Field>
                <Field label="Owner"><Input defaultValue="Maya Okafor" icon="user"/></Field>
                <Field label="Address" hint="Used for location-based analytics"><Input value={data.address} onChange={(e) => set('address', e.target.value)} icon="globe"/></Field>
                <Field label="Email"><Input defaultValue="maya@oliveandpine.co" icon="mail"/></Field>
                <Field label="Phone"><Input defaultValue="(503) 555-0182" prefix="+1"/></Field>
                <Field label="Website"><Input defaultValue="oliveandpine.co" prefix="https://"/></Field>
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h2 className="lp-h2">What kind of business?</h2>
              <p className="lp-page-sub">We&apos;ll tune review tone, suggested phrasing, and funnel templates to your category.</p>
              <div className="lp-grid lp-grid-3" style={{ marginTop: 22, gap: 12 }}>
                {([
                  {v:'Restaurant', icon:'shop',     sub:'Dining, cafés, bars'},
                  {v:'Salon',      icon:'sparkles', sub:'Hair, beauty, spa'},
                  {v:'Clinic',     icon:'shield',   sub:'Dental, medical'},
                  {v:'Retail',     icon:'package',  sub:'Stores, boutiques'},
                  {v:'Service',    icon:'cog',      sub:'Repair, cleaning'},
                  {v:'Hospitality',icon:'building', sub:'Hotels, lodging'},
                ] as const).map(o => (
                  <button key={o.v} onClick={() => set('industry', o.v)} className={`lp-pick ${data.industry === o.v ? 'is-on' : ''}`}>
                    <span className="lp-pick-icon"><Icon name={o.icon} size={20}/></span>
                    <div className="lp-pick-title">{o.v}</div>
                    <div className="lp-pick-sub">{o.sub}</div>
                    {data.industry === o.v && <span className="lp-pick-check"><Icon name="check" size={12}/></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="lp-h2">Connect your Google review link</h2>
              <p className="lp-page-sub">Customers who complete the funnel are redirected here to publish their review on Google.</p>
              <div style={{ marginTop: 22, maxWidth: 620 }}>
                <Field label="Google review URL" hint="Find this in your Google Business profile → Get more reviews">
                  <Input value={data.googleUrl} onChange={(e) => set('googleUrl', e.target.value)} icon="link"/>
                </Field>
                <div className={`lp-connect-status ${data.googleUrl.includes('g.page') ? 'is-ok' : ''}`}>
                  <span className="lp-connect-status-icon">
                    <Icon name={data.googleUrl.includes('g.page') ? 'check' : 'globe'} size={14}/>
                  </span>
                  <div>
                    <div className="lp-connect-status-title">
                      {data.googleUrl.includes('g.page') ? 'Connected — Olive & Pine Bistro' : 'Validating link…'}
                    </div>
                    <div className="lp-connect-status-sub">
                      {data.googleUrl.includes('g.page') ? '4.6 ★ · 1,284 reviews on Google' : 'Paste your shareable review link above'}
                    </div>
                  </div>
                  {data.googleUrl.includes('g.page') && <Badge tone="success" dot>Verified</Badge>}
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="lp-h2">Add your branding</h2>
              <p className="lp-page-sub">Show your logo and brand color on the customer review funnel.</p>
              <div className="lp-grid lp-grid-2" style={{ marginTop: 22, gap: 22 }}>
                <div>
                  <Field label="Brand color">
                    <div className="lp-color-row">
                      {['#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#0F172A'].map(c => (
                        <button key={c} onClick={() => set('primary', c)} className={`lp-color-sw ${data.primary === c ? 'is-on' : ''}`} style={{ background: c }}/>
                      ))}
                    </div>
                  </Field>
                  <Field label="Greeting message">
                    <Input defaultValue="Thanks for visiting Olive & Pine — would you share your experience?"/>
                  </Field>
                </div>
                <div>
                  <div className="lp-brand-preview-label">Live preview</div>
                  <div className="lp-phone">
                    <div className="lp-funnel" style={{ background: '#FAFAF7' }}>
                      <div className="lp-funnel-head">
                        <div className="lp-funnel-logo" style={{ background: data.primary, color: '#fff' }}>O&P</div>
                        <div className="lp-funnel-biz">{data.name}</div>
                      </div>
                      <div className="lp-funnel-body">
                        <div className="lp-funnel-h">Thanks for visiting!</div>
                        <div className="lp-funnel-cta" style={{ background: data.primary, color: '#fff' }}>Rate your visit</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="lp-h2">Request your physical QR materials</h2>
              <p className="lp-page-sub">We&apos;ll print and ship branded QR materials to your address. Free with Pro & Scale plans.</p>
              <div className="lp-grid lp-grid-2" style={{ marginTop: 22, gap: 12 }}>
                {([
                  {v:'table-tent', label:'Table tents',   sub:'Foldable card for tables', icon:'package'},
                  {v:'sticker',    label:'Counter sticker',sub:'Adhesive for counters',    icon:'dot'},
                  {v:'poster',     label:'Wall poster',    sub:'A4 print-ready',           icon:'monitor'},
                  {v:'receipt',    label:'Receipt logo',   sub:'Embed in POS receipts',    icon:'card'},
                ] as const).map(f => (
                  <button key={f.v} className="lp-pick lp-pick-h">
                    <span className="lp-pick-icon"><Icon name={f.icon} size={20}/></span>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div className="lp-pick-title">{f.label}</div>
                      <div className="lp-pick-sub">{f.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div>
              <h2 className="lp-h2">Choose your funnel style</h2>
              <p className="lp-page-sub">This is what customers see after scanning. You can fully customize later.</p>
              <div className="lp-grid lp-grid-4" style={{ marginTop: 22, gap: 12 }}>
                {['elegant','vivid','minimal','playful'].map(o => (
                  <button key={o} onClick={() => set('funnelStyle', o)} className={`lp-funnel-pick ${data.funnelStyle === o ? 'is-on' : ''}`}>
                    <div className={`lp-funnel-mini lp-funnel-mini-${o}`}>
                      <div className="lp-funnel-mini-logo"/>
                      <div className="lp-funnel-mini-bar"/>
                      <div className="lp-funnel-mini-bar short"/>
                      <div className="lp-funnel-mini-btn"/>
                    </div>
                    <div className="lp-pick-title" style={{ marginTop: 12, textTransform: 'capitalize' }}>{o}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 6 && (
            <div>
              <h2 className="lp-h2">Choose your plan</h2>
              <p className="lp-page-sub">14-day free trial. Cancel anytime. All prices billed monthly.</p>
              <div className="lp-grid lp-grid-3" style={{ marginTop: 22, gap: 14 }}>
                {[
                  {v:'starter', name:'Starter', price:19,  sub:'For new businesses', quota:'250 reviews / mo',    features:['1 location','Basic analytics','Email support'], primary:false},
                  {v:'pro',     name:'Pro',     price:49,  sub:'Most popular',       quota:'2,500 reviews / mo',  features:['5 locations','Funnel A/B testing','Branded QR materials','Priority support'], primary:true,  badge:'Most popular'},
                  {v:'scale',   name:'Scale',   price:149, sub:'Multi-location',     quota:'Unlimited reviews',   features:['Unlimited locations','Custom domain','Team accounts','Dedicated CSM'], primary:false},
                ].map(p => (
                  <button key={p.v} onClick={() => set('plan', p.v)} className={`lp-plan ${data.plan === p.v ? 'is-on' : ''} ${p.primary ? 'lp-plan-primary' : ''}`}>
                    {p.badge && <span className="lp-plan-badge">{p.badge}</span>}
                    <div className="lp-plan-name">{p.name}</div>
                    <div className="lp-plan-sub">{p.sub}</div>
                    <div className="lp-plan-price">
                      <span className="lp-plan-amt">${p.price}</span>
                      <span className="lp-plan-per">/ month</span>
                    </div>
                    <div className="lp-plan-quota">{p.quota}</div>
                    <ul className="lp-plan-feats">
                      {p.features.map(f => <li key={f}><Icon name="check" size={13}/>{f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lp-onb-foot">
          <Btn variant="ghost" icon="chevron" onClick={back} disabled={step === 0} style={{ transform: 'scaleX(-1)' }}/>
          <div className="lp-muted">Step {step + 1} of {STEPS.length}</div>
          {step < STEPS.length - 1
            ? <Btn variant="primary" iconRight="chevron" onClick={next}>Continue</Btn>
            : <Btn variant="primary" icon="check" onClick={() => router.push(BASE)}>Finish setup</Btn>}
        </div>
      </Card>
    </div>
  );
}
