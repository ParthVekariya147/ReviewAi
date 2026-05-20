'use client';

import { useState } from 'react';
import type { IconName } from '../ui';
import { Icon, Card, CardHeader, Btn, Badge, Progress, Field, Input, Segmented, Chart, fmt } from '../ui';

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="lp-page-hd">
      <div>
        <h1 className="lp-h1">{title}</h1>
        {sub && <div className="lp-page-sub">{sub}</div>}
      </div>
    </div>
  );
}

function UsageMeter({ label, value, max, icon, tone }: { label: string; value: number; max: number; icon: IconName; tone: string }) {
  const pctv = (value / max) * 100;
  return (
    <div className="lp-usage-meter">
      <div className="lp-flex lp-flex-between" style={{ marginBottom: 8, fontSize: 12.5 }}>
        <span className="lp-flex" style={{ gap: 6, color: 'var(--lp-fg-muted)' }}>
          <Icon name={icon} size={13}/> {label}
        </span>
        <span><b>{fmt(value)}</b> <span className="lp-muted">/ {fmt(max)}</span></span>
      </div>
      <Progress value={value} max={max} tone={tone}/>
      <div className="lp-muted" style={{ fontSize: 11, marginTop: 4 }}>{pctv.toFixed(0)}% of monthly quota</div>
    </div>
  );
}

const plans = [
  { v:'starter', name:'Starter', price:{monthly:19,yearly:16},  sub:'For new businesses', quota:'250 reviews / mo',    features:['1 location','Basic analytics','Email support','Branded funnel'] },
  { v:'pro',     name:'Pro',     price:{monthly:49,yearly:39},  sub:'Most popular',       quota:'2,500 reviews / mo',  features:['5 locations','Funnel A/B testing','Branded QR materials','Priority support','Custom tones'], badge:'Current plan', current:true },
  { v:'scale',   name:'Scale',   price:{monthly:149,yearly:119}, sub:'Multi-location',     quota:'Unlimited reviews',   features:['Unlimited locations','Custom domain','Team accounts','Dedicated CSM','API access'] },
];

const invoices = [
  {id:'INV-2026-05-001', date:'May 1, 2026',  amount:49, status:'paid', period:'May 2026'},
  {id:'INV-2026-04-001', date:'Apr 1, 2026',  amount:49, status:'paid', period:'Apr 2026'},
  {id:'INV-2026-03-001', date:'Mar 1, 2026',  amount:49, status:'paid', period:'Mar 2026'},
  {id:'INV-2026-02-001', date:'Feb 1, 2026',  amount:49, status:'paid', period:'Feb 2026'},
  {id:'INV-2026-01-001', date:'Jan 1, 2026',  amount:49, status:'paid', period:'Jan 2026'},
  {id:'INV-2025-12-001', date:'Dec 1, 2025',  amount:19, status:'paid', period:'Dec 2025'},
];

export default function ScreenBilling() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="lp-page">
      <PageHeader title="Subscription & billing" sub="Manage your plan, payment method and invoices"/>

      <div className="lp-callout" style={{ background: 'var(--lp-violet-soft)', borderColor: 'var(--lp-violet-soft)' }}>
        <Icon name="zap" size={16} style={{ color: 'var(--lp-violet)' }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5 }}><b>Pro trial — 9 days left.</b> Trial ends May 29, 2026 · you won&apos;t be charged until then.</div>
          <div className="lp-muted" style={{ fontSize: 12 }}>Cancel anytime from this page · your data is kept for 60 days after cancellation.</div>
        </div>
        <Btn variant="ghost" size="sm">Cancel trial</Btn>
        <Btn variant="primary" size="sm">Keep Pro · $49/mo</Btn>
      </div>

      <Card>
        <div className="lp-flex" style={{ gap: 20, alignItems: 'flex-start' }}>
          <div className="lp-plan-icon"><Icon name="rocket" size={20}/></div>
          <div style={{ flex: 1 }}>
            <div className="lp-flex lp-flex-between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="lp-eyebrow">Current plan</div>
                <h2 className="lp-h2" style={{ margin: '4px 0 6px' }}>Pro · $49/month</h2>
                <div className="lp-muted">Renews <b>June 1, 2026</b> · 2,500 reviews/mo · 5 locations</div>
              </div>
              <Badge tone="success" dot>Active</Badge>
            </div>
            <div className="lp-grid lp-grid-3" style={{ marginTop: 18, gap: 14 }}>
              <UsageMeter label="Reviews used"     value={1284} max={2500} icon="sparkles" tone="primary"/>
              <UsageMeter label="Active campaigns" value={4}    max={10}   icon="qr"       tone="violet"/>
              <UsageMeter label="Team members"     value={3}    max={5}    icon="team"     tone="cyan"/>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Upgrade or change plan"
          subtitle="14-day free trial on any upgrade"
          action={
            <Segmented value={billing} onChange={(v) => setBilling(v as 'monthly' | 'yearly')} options={[
              {value:'monthly',label:'Monthly'},{value:'yearly',label:'Yearly · save 20%'},
            ]}/>
          }
        />
        <div className="lp-grid lp-grid-3" style={{ gap: 14, marginTop: 8 }}>
          {plans.map(p => (
            <div key={p.v} className={`lp-plan ${p.current ? 'lp-plan-primary is-on' : ''}`} style={{ cursor: 'default' }}>
              {p.badge && <span className="lp-plan-badge">{p.badge}</span>}
              <div className="lp-plan-name">{p.name}</div>
              <div className="lp-plan-sub">{p.sub}</div>
              <div className="lp-plan-price">
                <span className="lp-plan-amt">${p.price[billing]}</span>
                <span className="lp-plan-per">/ {billing === 'monthly' ? 'month' : 'month, billed yearly'}</span>
              </div>
              <div className="lp-plan-quota">{p.quota}</div>
              <ul className="lp-plan-feats">
                {p.features.map(f => <li key={f}><Icon name="check" size={13}/>{f}</li>)}
              </ul>
              {p.current
                ? <Btn variant="secondary" className="lp-block" disabled>Current plan</Btn>
                : <Btn variant={p.v === 'scale' ? 'primary' : 'secondary'} className="lp-block">{p.v === 'starter' ? 'Downgrade' : 'Upgrade'}</Btn>}
            </div>
          ))}
        </div>
      </Card>

      <div className="lp-grid lp-grid-2">
        <Card>
          <CardHeader title="Payment method" action={<Btn variant="ghost" size="sm" icon="edit">Change</Btn>}/>
          <div className="lp-pay-card">
            <div className="lp-pay-card-brand">VISA</div>
            <div>
              <div style={{ fontWeight: 600 }}>•••• •••• •••• 4242</div>
              <div className="lp-muted">Expires 09/27 · Maya Okafor</div>
            </div>
            <Badge tone="success" dot>Default</Badge>
          </div>
          <div className="lp-grid lp-grid-2" style={{ marginTop: 14 }}>
            <Field label="Billing email"><Input defaultValue="maya@oliveandpine.co" icon="mail"/></Field>
            <Field label="Tax ID"><Input defaultValue="US 87-1234567"/></Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Spend over time" subtitle="Last 6 months"/>
          <Chart
            data={['Dec','Jan','Feb','Mar','Apr','May'].map((x, i) => ({ x, amount:[19,49,49,49,49,49][i] }))}
            keys={['amount']} colors={['primary']} kind="bar" height={170} yTicks={3}
            formatY={(v) => `$${v}`}
          />
          <div className="lp-flex lp-flex-between" style={{ marginTop: 8, fontSize: 12.5 }}>
            <span className="lp-muted">Total this year</span>
            <span><b>$245.00</b></span>
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div style={{ padding: '18px 22px 0' }}>
          <CardHeader title="Invoices" subtitle="Download for accounting" action={<Btn variant="ghost" size="sm" icon="download">Export all</Btn>}/>
        </div>
        <table className="lp-table">
          <thead>
            <tr><th>Invoice</th><th>Date</th><th>Period</th><th className="lp-num">Amount</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><b>{inv.id}</b></td>
                <td>{inv.date}</td>
                <td className="lp-muted">{inv.period}</td>
                <td className="lp-num"><b>${inv.amount.toFixed(2)}</b></td>
                <td><Badge tone="success" dot>{inv.status}</Badge></td>
                <td><Btn variant="ghost" size="sm" icon="download"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
