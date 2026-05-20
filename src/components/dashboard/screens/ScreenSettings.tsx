'use client';

import { useState } from 'react';
import { Icon, Card, CardHeader, Btn, Badge, Avatar, Field, Input, Select, Switch, StarRating } from '../ui';

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
      <Switch checked={on} onChange={setOn}/>
    </div>
  );
}

const SECTIONS = [
  {v:'profile',  label:'Business profile',    icon:'building'},
  {v:'brand',    label:'Branding',            icon:'sparkles'},
  {v:'funnel',   label:'Funnel defaults',     icon:'funnel'},
  {v:'notifs',   label:'Notifications',       icon:'bell'},
  {v:'team',     label:'Team access',         icon:'team'},
  {v:'security', label:'Security',            icon:'shield'},
  {v:'api',      label:'API & webhooks',      icon:'key'},
  {v:'billing',  label:'Billing preferences', icon:'card'},
] as const;

export default function ScreenSettings() {
  const [section, setSection] = useState('profile');

  return (
    <div className="lp-page">
      <PageHeader
        title="Settings"
        sub="Account, business and dashboard preferences"
        actions={<Btn variant="primary" icon="check">Save changes</Btn>}
      />
      <div className="lp-grid" style={{ gridTemplateColumns: '220px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Card padded={false} className="lp-sett-nav">
          {SECTIONS.map(s => (
            <button key={s.v} onClick={() => setSection(s.v)} className={`lp-sett-nav-item ${section === s.v ? 'is-on' : ''}`}>
              <Icon name={s.icon} size={15}/>
              <span>{s.label}</span>
            </button>
          ))}
        </Card>

        <div className="lp-stack">
          {section === 'profile'  && <SettProfile/>}
          {section === 'brand'    && <SettBrand/>}
          {section === 'funnel'   && <SettFunnel/>}
          {section === 'notifs'   && <SettNotifs/>}
          {section === 'team'     && <SettTeam/>}
          {section === 'security' && <SettSecurity/>}
          {section === 'api'      && <SettApi/>}
          {section === 'billing'  && <SettBillingPrefs/>}
        </div>
      </div>
    </div>
  );
}

function SettProfile() {
  return (
    <>
      <Card>
        <CardHeader title="Business profile" subtitle="Public details about your business"/>
        <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
          <Field label="Business name"><Input defaultValue="Olive & Pine Bistro"/></Field>
          <Field label="Industry"><Select value="Restaurant" options={['Restaurant','Salon','Clinic','Retail','Service']} onChange={() => {}}/></Field>
          <Field label="Public email"><Input defaultValue="hello@oliveandpine.co" icon="mail"/></Field>
          <Field label="Phone"><Input defaultValue="(503) 555-0182"/></Field>
          <Field label="Website"><Input defaultValue="oliveandpine.co" prefix="https://"/></Field>
          <Field label="Timezone"><Select value="pst" options={[{value:'pst',label:'Pacific Time (PT)'},{value:'est',label:'Eastern Time (ET)'}]} onChange={() => {}}/></Field>
        </div>
      </Card>
      <Card>
        <CardHeader title="Owner account"/>
        <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
          <Field label="Full name"><Input defaultValue="Maya Okafor"/></Field>
          <Field label="Email"><Input defaultValue="maya@oliveandpine.co"/></Field>
        </div>
      </Card>
    </>
  );
}

function SettBrand() {
  return (
    <Card>
      <CardHeader title="Branding" subtitle="How your business appears on customer review funnels"/>
      <Field label="Logo">
        <div className="lp-upload">
          <div className="lp-upload-logo" style={{ background: '#6366F1' }}>O&P</div>
          <div style={{ flex: 1 }}>
            <div className="lp-upload-title">olive-pine-logo.svg</div>
            <div className="lp-upload-sub">512×512 · uploaded May 1, 2026</div>
          </div>
          <Btn variant="ghost" size="sm" icon="upload">Replace</Btn>
        </div>
      </Field>
      <Field label="Brand colors">
        <div className="lp-color-row">
          {['#6366F1','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444','#0F172A'].map(c => (
            <button key={c} className={`lp-color-sw ${c === '#6366F1' ? 'is-on' : ''}`} style={{ background: c }}/>
          ))}
        </div>
      </Field>
      <Field label="Tagline"><Input defaultValue="Wood-fired comfort food, Portland's NW neighborhood since 2019."/></Field>
      <Field label="Custom domain" hint="Use your own domain instead of reevo.io/r/...">
        <Input defaultValue="reviews.oliveandpine.co"/>
      </Field>
    </Card>
  );
}

function SettFunnel() {
  return (
    <Card>
      <CardHeader title="Funnel defaults" subtitle="Applied to all new funnels"/>
      <Field label="Default tone"><Select value="warm" options={['warm','professional','casual','enthusiastic']} onChange={() => {}}/></Field>
      <Field label="Default language"><Select value="english" options={['english','spanish','french','german']} onChange={() => {}}/></Field>
      <Field label="Star threshold for Google redirect">
        <StarRating value={4} readonly/>
      </Field>
      <Switch label="Disclose AI assistance" sub="Show 'AI-assisted' label on funnel" checked={true} onChange={() => {}}/>
      <Switch label="Throttle repeat scans" sub="One review per device per 30 days" checked={true} onChange={() => {}}/>
      <Switch label="Capture low ratings privately" sub="Don't redirect <4★ ratings to Google" checked={true} onChange={() => {}}/>
    </Card>
  );
}

function SettNotifs() {
  return (
    <Card>
      <CardHeader title="Notification preferences"/>
      <div className="lp-stack" style={{ gap: 12 }}>
        <NotifPref title="New 5★ reviews"          sub="Push + email"    defaultOn/>
        <NotifPref title="Low ratings captured"     sub="Email only"      defaultOn/>
        <NotifPref title="Quota alerts"             sub="Email + SMS"     defaultOn/>
        <NotifPref title="Funnel performance digest" sub="Weekly summary"/>
        <NotifPref title="Team activity"            sub="Push"/>
        <NotifPref title="Billing & invoices"       sub="Email"           defaultOn/>
        <NotifPref title="Product updates"          sub="Email"/>
      </div>
    </Card>
  );
}

function SettTeam() {
  const team = [
    {name:'Maya Okafor',  email:'maya@oliveandpine.co',   role:'Owner',  status:'active'},
    {name:'Jordan Chen',  email:'jordan@oliveandpine.co', role:'Admin',  status:'active'},
    {name:'Sam Rivers',   email:'sam@oliveandpine.co',    role:'Editor', status:'active'},
    {name:'Tess Patel',   email:'tess@oliveandpine.co',   role:'Viewer', status:'pending'},
  ];
  return (
    <>
      <Card>
        <CardHeader title="Team members" subtitle="3 of 5 seats used" action={<Btn variant="primary" icon="plus" size="sm">Invite member</Btn>}/>
        <table className="lp-table lp-table-tight">
          <thead><tr><th>Member</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {team.map(m => (
              <tr key={m.email}>
                <td>
                  <div className="lp-tcell-main">
                    <Avatar name={m.name} size={28}/>
                    <div>
                      <div className="lp-tcell-name">{m.name}</div>
                      <div className="lp-tcell-sub">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td><Select value={m.role} options={['Owner','Admin','Editor','Viewer']} onChange={() => {}}/></td>
                <td><Badge tone={m.status === 'active' ? 'success' : 'warning'} dot>{m.status}</Badge></td>
                <td><Btn variant="ghost" size="sm" icon="more"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <CardHeader title="Role permissions"/>
        <div className="lp-perm-grid">
          <div className="lp-perm-row lp-perm-head">
            <span>Permission</span><span>Owner</span><span>Admin</span><span>Editor</span><span>Viewer</span>
          </div>
          {[
            ['Edit funnel',         true,  true,  true,  false],
            ['Create QR campaigns', true,  true,  true,  false],
            ['View analytics',      true,  true,  true,  true],
            ['Manage billing',      true,  false, false, false],
            ['Invite teammates',    true,  true,  false, false],
          ].map(([label, ...perms]) => (
            <div className="lp-perm-row" key={String(label)}>
              <span>{label}</span>
              {perms.map((p, i) => (
                <span key={i}>
                  {p ? <Icon name="check" size={14} style={{ color:'var(--lp-success)' }}/> : <Icon name="x" size={14} style={{ color:'var(--lp-fg-muted)' }}/>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function SettSecurity() {
  return (
    <>
      <Card>
        <CardHeader title="Password"/>
        <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
          <Field label="Current password"><Input type="password" defaultValue="••••••••" icon="lock"/></Field>
          <Field label="New password"><Input type="password" placeholder="At least 12 characters" icon="lock"/></Field>
        </div>
        <Btn variant="primary" icon="check">Update password</Btn>
      </Card>
      <Card>
        <CardHeader title="Two-factor authentication"/>
        <Switch label="Authenticator app" sub="Use Authy, 1Password or similar" checked={true} onChange={() => {}}/>
        <Switch label="SMS verification"  sub="As backup" checked={true} onChange={() => {}}/>
        <Switch label="Recovery codes"    sub="10 single-use codes" checked={false} onChange={() => {}}/>
      </Card>
      <Card>
        <CardHeader title="Active sessions" subtitle="Currently signed-in devices"/>
        {([
          {device:'MacBook Pro · Chrome', loc:'Portland, OR', last:'Active now',  icon:'monitor',    current:true},
          {device:'iPhone 15 · Reevo iOS',loc:'Portland, OR', last:'12 min ago', icon:'smartphone',  current:false},
          {device:'iPad Air · Safari',     loc:'Beaverton, OR',last:'Yesterday',  icon:'tablet',      current:false},
        ] as const).map((s, i) => (
          <div className="lp-session" key={i}>
            <span className="lp-session-icon"><Icon name={s.icon} size={16}/></span>
            <div style={{ flex: 1 }}>
              <div><b>{s.device}</b> {s.current && <Badge tone="primary">This device</Badge>}</div>
              <div className="lp-muted" style={{ fontSize: 12 }}>{s.loc} · {s.last}</div>
            </div>
            {!s.current && <Btn variant="ghost" size="sm">Revoke</Btn>}
          </div>
        ))}
      </Card>
    </>
  );
}

function SettApi() {
  return (
    <>
      <Card>
        <CardHeader title="API keys" subtitle="Use to access your funnel data programmatically" action={<Btn variant="primary" icon="plus" size="sm">Generate key</Btn>}/>
        <table className="lp-table lp-table-tight">
          <thead><tr><th>Name</th><th>Key</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {[
              {name:'Production',    key:'reevo_live_5a8c•••e92f', created:'Apr 1, 2026'},
              {name:'Reporting CSV', key:'reevo_live_3b21•••f7d0', created:'Mar 12, 2026'},
            ].map(k => (
              <tr key={k.name}>
                <td><b>{k.name}</b></td>
                <td><code>{k.key}</code></td>
                <td className="lp-muted">{k.created}</td>
                <td><Btn variant="ghost" size="sm" icon="copy"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <CardHeader title="Webhooks" action={<Btn variant="ghost" icon="plus" size="sm">Add webhook</Btn>}/>
        {[
          {url:'https://oliveandpine.co/webhooks/reevo', events:'review.submitted, redirect.completed'},
          {url:'https://hooks.zapier.com/...abc123',     events:'scan.created'},
        ].map(w => (
          <div className="lp-webhook" key={w.url}>
            <span className="lp-webhook-icon"><Icon name="link" size={14}/></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lp-truncate"><b>{w.url}</b></div>
              <div className="lp-muted" style={{ fontSize: 12 }}>{w.events}</div>
            </div>
            <Badge tone="success" dot>Active</Badge>
          </div>
        ))}
      </Card>
    </>
  );
}

function SettBillingPrefs() {
  return (
    <Card>
      <CardHeader title="Billing preferences"/>
      <Field label="Billing email"><Input defaultValue="maya@oliveandpine.co" icon="mail"/></Field>
      <Field label="Receipt language"><Select value="english" options={['english','spanish','french']} onChange={() => {}}/></Field>
      <Field label="Tax ID"><Input defaultValue="US 87-1234567"/></Field>
      <Switch label="Auto-upgrade plan when at 100% quota" sub="Avoid funnel disruption — billed pro-rated" checked={false} onChange={() => {}}/>
      <Switch label="Send monthly statement to accountant" sub="cc: accounting@oliveandpine.co" checked={true} onChange={() => {}}/>
    </Card>
  );
}
