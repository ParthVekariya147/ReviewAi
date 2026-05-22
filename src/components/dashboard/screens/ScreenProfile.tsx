'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Icon, Card, CardHeader, Btn, Progress, StarRating, Field, Input, Select } from '../ui';

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
  business_type:         string | null;
  review_keywords:       string | null;
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

function FunnelMockup({ color, initials, name }: { color: string; initials: string; name: string }) {
  return (
    <div className="lp-funnel" style={{ background: '#FAFAF7', color: '#0F0F12', fontFamily: 'ui-serif, Georgia, serif' }}>
      <div className="lp-funnel-head">
        <div className="lp-funnel-logo" style={{ background: color, color: '#fff' }}>
          {initials || name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div className="lp-funnel-biz">{name || 'Your Business'}</div>
      </div>
      <div className="lp-funnel-body">
        <div className="lp-funnel-h">Thanks for visiting!</div>
        <div className="lp-funnel-sub">We&apos;d love to hear about your experience.</div>
        <div className="lp-funnel-stars-prompt">
          {[1,2,3,4,5].map(i => <span key={i} className="lp-funnel-star-prompt">★</span>)}
        </div>
        <div className="lp-funnel-cta" style={{ background: color, color: '#fff' }}>Rate your visit</div>
      </div>
    </div>
  );
}

const INDUSTRIES = [
  { value: 'Restaurant',   label: 'Restaurant'   },
  { value: 'Salon',        label: 'Salon'         },
  { value: 'Clinic',       label: 'Clinic'        },
  { value: 'Retail',       label: 'Retail'        },
  { value: 'Service',      label: 'Service'       },
  { value: 'Hospitality',  label: 'Hospitality'   },
  { value: 'Other',        label: 'Other'         },
];


// ── main component ────────────────────────────────────────────

export default function ScreenProfile({ initialBusiness, user }: Props) {
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const { data: rep } = useSWR<{
    avg_rating: number;
    total_reviews: number;
    distribution: Record<number, number>;
  }>('/api/businesses/reputation', fetcher);

  const [form, setForm] = useState({
    name:             initialBusiness?.name             ?? '',
    tagline:          initialBusiness?.tagline           ?? '',
    google_link:      initialBusiness?.google_link       ?? '',
    brand_color:      initialBusiness?.brand_color       ?? '#6E5BFF',
    logo_initials:    initialBusiness?.logo_initials     ?? '',
    business_type:    initialBusiness?.business_type     ?? '',
    review_keywords:  initialBusiness?.review_keywords   ?? '',
  });

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setSaveState('idle');
  }

  async function save() {
    setSaveState('saving');
    const ok = await patchBusiness(form);
    setSaveState(ok ? 'saved' : 'error');
    if (ok) setTimeout(() => setSaveState('idle'), 2500);
  }

  const saveLabel =
    saveState === 'saving' ? 'Saving…' :
    saveState === 'saved'  ? 'Saved!'  :
    saveState === 'error'  ? 'Error'   : 'Save changes';

  const ownerName = user.full_name || user.email.split('@')[0];

  return (
    <div className="lp-page">
      <PageHeader
        title="Business profile"
        sub="Public details, branding & customer-facing identity"
        actions={
          <Btn variant="primary" icon="check" onClick={save}>
            {saveLabel}
          </Btn>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 16 }}>
        <div className="lp-stack">
          <Card>
            <CardHeader title="Identity" />
            <div className="lp-flex" style={{ gap: 18, alignItems: 'center' }}>
              <div className="lp-logo-big" style={{ background: form.brand_color }}>
                {form.logo_initials || form.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || '??'}
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Business name">
                  <Input value={form.name} onChange={e => set('name', e.target.value)} />
                </Field>
              </div>
            </div>
            <div className="lp-grid lp-grid-2" style={{ marginTop: 14 }}>
              <Field label="Business type" hint="Helps AI write relevant reviews">
                <Select
                  value={form.business_type || 'Other'}
                  options={INDUSTRIES}
                  onChange={v => set('business_type', v)}
                />
              </Field>
              <Field label="Owner">
                <Input defaultValue={ownerName} />
              </Field>
              <Field label="Account email">
                <Input defaultValue={user.email} />
              </Field>
            </div>
            <Field label="Tagline" hint="Shown on the funnel landing page">
              <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} />
            </Field>
            <Field
              label="Review keywords"
              hint="Comma-separated highlights the AI will naturally weave into reviews — e.g. wood-fired pizza, cozy patio, fast service"
            >
              <Input
                value={form.review_keywords}
                onChange={e => set('review_keywords', e.target.value)}
                placeholder="e.g. friendly staff, great ambiance, quick service"
              />
            </Field>
          </Card>

          <Card>
            <CardHeader title="Google review link" subtitle="Used as the destination for completed funnels" />
            <div className="lp-grid lp-grid-2" style={{ gap: 16 }}>
              <Field label="Google review URL">
                <Input
                  value={form.google_link}
                  onChange={e => set('google_link', e.target.value)}
                  icon="link"
                  placeholder="https://g.page/r/…/review"
                />
              </Field>
              <Field label="Status">
                {form.google_link ? (
                  <div className="lp-connect-status is-ok" style={{ marginTop: 0 }}>
                    <span className="lp-connect-status-icon"><Icon name="check" size={14} /></span>
                    <div>
                      <div className="lp-connect-status-title">URL set</div>
                      <div className="lp-connect-status-sub">Funnels will redirect here</div>
                    </div>
                  </div>
                ) : (
                  <div className="lp-connect-status" style={{ marginTop: 0 }}>
                    <span className="lp-connect-status-icon"><Icon name="link" size={14} /></span>
                    <div>
                      <div className="lp-connect-status-title">Not set</div>
                      <div className="lp-connect-status-sub">Add a URL to enable redirects</div>
                    </div>
                  </div>
                )}
              </Field>
            </div>
          </Card>
        </div>

        <div className="lp-stack">
          <Card>
            <CardHeader title="Reputation summary" />
            {!rep ? (
              <div style={{ padding: '16px 0', color: 'var(--lp-fg-muted)', fontSize: 13 }}>Loading…</div>
            ) : rep.total_reviews === 0 ? (
              <div style={{ padding: '16px 0', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
                No reviews yet — share your QR code to start collecting feedback.
              </div>
            ) : (
              <>
                <div className="lp-rep-big">
                  <div className="lp-rep-big-num">{rep.avg_rating.toFixed(1)}</div>
                  <div>
                    <StarRating value={Math.round(rep.avg_rating)} readonly />
                    <div className="lp-muted">across {rep.total_reviews.toLocaleString()} reviews</div>
                  </div>
                </div>
                <div className="lp-rep-bars">
                  {[5,4,3,2,1].map(r => {
                    const tone = r >= 4 ? 'success' : r === 3 ? 'warning' : 'danger';
                    const count = rep.distribution[r] ?? 0;
                    const max = Math.max(...Object.values(rep.distribution), 1);
                    return (
                      <div className="lp-rep-bar" key={r}>
                        <span className="lp-rep-bar-num">{r}★</span>
                        <Progress value={count} max={max} tone={tone} height={6} />
                        <span className="lp-rep-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>

          <Card>
            <CardHeader title="Branding preview" />
            <div className="lp-phone" style={{ margin: '0 auto' }}>
              <FunnelMockup
                color={form.brand_color}
                initials={form.logo_initials}
                name={form.name}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
