'use client';

import { useState } from 'react';
import { Icon, Card, CardHeader, Btn, Badge, Avatar, Field, Input, Select, Switch, StarRating } from '../ui';

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
}

interface UserInfo { id: string; email: string; full_name: string }

interface Props {
  initialBusiness: Business | null;
  user:            UserInfo;
}

// ── helpers ───────────────────────────────────────────────────

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

async function patchBusiness(updates: Partial<Business>): Promise<boolean> {
  const res = await fetch('/api/businesses', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(updates),
  });
  return res.ok;
}

// ── page header ───────────────────────────────────────────────

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

function NotifPref({ title, sub, defaultOn = false }: { title: string; sub: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="lp-flex lp-flex-between" style={{ alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13 }}>{title}</div>
        <div className="lp-muted" style={{ fontSize: 11 }}>{sub}</div>
      </div>
      <Switch checked={on} onChange={setOn} />
    </div>
  );
}

const SECTIONS = [
  { v: 'profile',  label: 'Business profile',    icon: 'building' },
  { v: 'brand',    label: 'Branding',            icon: 'sparkles' },
  { v: 'funnel',   label: 'Funnel defaults',     icon: 'funnel'   },
  { v: 'notifs',   label: 'Notifications',       icon: 'bell'     },
  { v: 'team',     label: 'Team access',         icon: 'team'     },
  { v: 'security', label: 'Security',            icon: 'shield'   },
  { v: 'api',      label: 'API & webhooks',      icon: 'key'      },
  { v: 'billing',  label: 'Billing preferences', icon: 'card'     },
] as const;

const BRAND_COLORS = ['#6E5BFF','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#0F172A'];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French'  },
  { value: 'de', label: 'German'  },
];

// ── main component ────────────────────────────────────────────

export default function ScreenSettings({ initialBusiness, user }: Props) {
  const [section,   setSection]   = useState('profile');
  const [saveState, setSaveState] = useState<SaveState>('idle');

  // Single form state covering all editable business fields
  const [form, setForm] = useState({
    name:                  initialBusiness?.name                  ?? '',
    tagline:               initialBusiness?.tagline               ?? '',
    google_link:           initialBusiness?.google_link           ?? '',
    brand_color:           initialBusiness?.brand_color           ?? '#6E5BFF',
    logo_initials:         initialBusiness?.logo_initials         ?? '',
    min_rating_for_google: initialBusiness?.min_rating_for_google ?? 4,
    language:              initialBusiness?.language              ?? 'en',
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

  return (
    <div className="lp-page">
      <PageHeader
        title="Settings"
        sub="Account, business and dashboard preferences"
        actions={
          <Btn
            variant="primary"
            icon="check"
            onClick={save}
          >
            {saveLabel}
          </Btn>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: '220px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Card padded={false} className="lp-sett-nav">
          {SECTIONS.map(s => (
            <button key={s.v} onClick={() => setSection(s.v)} className={`lp-sett-nav-item ${section === s.v ? 'is-on' : ''}`}>
              <Icon name={s.icon} size={15} />
              <span>{s.label}</span>
            </button>
          ))}
        </Card>

        <div className="lp-stack">
          {section === 'profile' && (
            <>
              <Card>
                <CardHeader title="Business profile" subtitle="Public details about your business" />
                <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
                  <Field label="Business name">
                    <Input value={form.name} onChange={e => set('name', e.target.value)} />
                  </Field>
                  <Field label="Language">
                    <Select value={form.language} options={LANGUAGES} onChange={v => set('language', v)} />
                  </Field>
                  <Field label="Google review URL" hint="Destination for completed 4★+ funnels">
                    <Input value={form.google_link} onChange={e => set('google_link', e.target.value)} icon="link" />
                  </Field>
                  <Field label="Tagline">
                    <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} />
                  </Field>
                </div>
              </Card>
              <Card>
                <CardHeader title="Owner account" />
                <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
                  <Field label="Full name"><Input defaultValue={user.full_name || user.email.split('@')[0]} /></Field>
                  <Field label="Email"><Input defaultValue={user.email} /></Field>
                </div>
              </Card>
            </>
          )}

          {section === 'brand' && (
            <Card>
              <CardHeader title="Branding" subtitle="How your business appears on customer review funnels" />
              <Field label="Logo initials" hint="Shown in the funnel header when no logo is uploaded">
                <Input value={form.logo_initials} maxLength={2} onChange={e => set('logo_initials', e.target.value.toUpperCase())} style={{ width: 80 }} />
              </Field>
              <Field label="Brand color">
                <div className="lp-color-row">
                  {BRAND_COLORS.map(c => (
                    <button
                      key={c}
                      className={`lp-color-sw ${form.brand_color === c ? 'is-on' : ''}`}
                      style={{ background: c }}
                      onClick={() => set('brand_color', c)}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Tagline">
                <Input value={form.tagline} onChange={e => set('tagline', e.target.value)} />
              </Field>
            </Card>
          )}

          {section === 'funnel' && (
            <Card>
              <CardHeader title="Funnel defaults" subtitle="Applied to all new funnels" />
              <Field label="Language">
                <Select value={form.language} options={LANGUAGES} onChange={v => set('language', v)} />
              </Field>
              <Field label="Star threshold for Google redirect" hint="Ratings at or above this score redirect to Google">
                <div className="lp-flex" style={{ gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <StarRating value={form.min_rating_for_google} readonly />
                  <Select
                    value={String(form.min_rating_for_google)}
                    options={[
                      { value: '3', label: '3★ and above' },
                      { value: '4', label: '4★ and above' },
                      { value: '5', label: '5★ only'      },
                    ]}
                    onChange={v => set('min_rating_for_google', parseInt(v))}
                  />
                </div>
              </Field>
              <Switch label="Capture low ratings privately" sub="Don't redirect below threshold to Google" checked={true} onChange={() => {}} />
              <Switch label="Disclose AI assistance"        sub="Show 'AI-assisted' label on funnel"     checked={true} onChange={() => {}} />
              <Switch label="Throttle repeat scans"         sub="One review per device per 30 days"      checked={true} onChange={() => {}} />
            </Card>
          )}

          {section === 'notifs' && (
            <Card>
              <CardHeader title="Notification preferences" />
              <div className="lp-stack" style={{ gap: 12 }}>
                <NotifPref title="New 5★ reviews"           sub="Push + email"    defaultOn />
                <NotifPref title="Low ratings captured"     sub="Email only"      defaultOn />
                <NotifPref title="Quota alerts"             sub="Email + SMS"     defaultOn />
                <NotifPref title="Funnel performance digest" sub="Weekly summary" />
                <NotifPref title="Team activity"            sub="Push" />
                <NotifPref title="Billing & invoices"       sub="Email"           defaultOn />
                <NotifPref title="Product updates"          sub="Email" />
              </div>
            </Card>
          )}

          {section === 'team' && (
            <>
              <Card>
                <CardHeader title="Team members" subtitle="Manage who has access to this dashboard" action={<Btn variant="primary" icon="plus" size="sm">Invite member</Btn>} />
                <table className="lp-table lp-table-tight">
                  <thead><tr><th>Member</th><th>Role</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {[
                      { name: user.full_name || user.email.split('@')[0], email: user.email, role: 'Owner', status: 'active' },
                    ].map(m => (
                      <tr key={m.email}>
                        <td>
                          <div className="lp-tcell-main">
                            <Avatar name={m.name} size={28} />
                            <div>
                              <div className="lp-tcell-name">{m.name}</div>
                              <div className="lp-tcell-sub">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><Badge tone="primary">Owner</Badge></td>
                        <td><Badge tone="success" dot>active</Badge></td>
                        <td />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {section === 'security' && (
            <>
              <Card>
                <CardHeader title="Password" />
                <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
                  <Field label="Current password"><Input type="password" placeholder="Enter current password" icon="lock" /></Field>
                  <Field label="New password"><Input type="password" placeholder="At least 12 characters" icon="lock" /></Field>
                </div>
                <Btn variant="primary" icon="check">Update password</Btn>
              </Card>
              <Card>
                <CardHeader title="Two-factor authentication" />
                <Switch label="Authenticator app" sub="Use Authy, 1Password or similar" checked={false} onChange={() => {}} />
                <Switch label="SMS verification"  sub="As backup" checked={false} onChange={() => {}} />
              </Card>
            </>
          )}

          {section === 'api' && (
            <Card>
              <CardHeader title="API & webhooks" subtitle="Coming in a future update" />
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
                API key management and webhook configuration will be available soon.
              </div>
            </Card>
          )}

          {section === 'billing' && (
            <Card>
              <CardHeader title="Billing preferences" />
              <Field label="Billing email"><Input defaultValue={user.email} icon="mail" /></Field>
              <Field label="Receipt language"><Select value="en" options={LANGUAGES} onChange={() => {}} /></Field>
              <Switch label="Auto-upgrade plan when at 100% quota" sub="Avoid funnel disruption — billed pro-rated" checked={false} onChange={() => {}} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
