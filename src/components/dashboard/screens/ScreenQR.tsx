'use client';

import { useState } from 'react';
import type { IconName } from '../ui';
import { Icon, Card, CardHeader, Btn, Badge, Counter, Chart, Heatmap, Switch, QRCanvas, fmt, pct, dayLabels } from '../ui';

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

function MicroStat({ label, value, suffix, icon }: { label: string; value: number; suffix?: string; icon: IconName; tone?: string }) {
  return (
    <div className="lp-microstat">
      <div className="lp-microstat-label"><Icon name={icon} size={12}/> {label}</div>
      <div className="lp-microstat-val"><Counter value={value} suffix={suffix || ''}/></div>
    </div>
  );
}

const campaigns = [
  { id: 'fc-2k4', name: 'Front Counter',  url: 'reevo.io/r/fc-2k4', scans: 1284, conv: 0.412, status: 'live',   color: 'primary' },
  { id: 'tt-7j1', name: 'Table Tents',    url: 'reevo.io/r/tt-7j1', scans: 942,  conv: 0.387, status: 'live',   color: 'violet' },
  { id: 'rc-9m2', name: 'Receipts',       url: 'reevo.io/r/rc-9m2', scans: 614,  conv: 0.341, status: 'live',   color: 'cyan' },
  { id: 'le-4p8', name: 'Loyalty Email',  url: 'reevo.io/r/le-4p8', scans: 211,  conv: 0.298, status: 'paused', color: 'warning' },
  { id: 'ev-3k7', name: 'Patio Event',    url: 'reevo.io/r/ev-3k7', scans: 89,   conv: 0.221, status: 'draft',  color: 'neutral' },
];

export default function ScreenQR() {
  const [selected, setSelected] = useState('fc-2k4');
  const current = campaigns.find(c => c.id === selected)!;
  const url = `https://${current.url}`;

  return (
    <div className="lp-page">
      <PageHeader
        title="QR codes"
        sub="Generate, customize and track QR campaigns"
        actions={
          <>
            <Btn icon="package">Order printed materials</Btn>
            <Btn variant="primary" icon="plus">New campaign</Btn>
          </>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
        <div className="lp-stack">
          <Card>
            <div className="lp-flex" style={{ gap: 28, alignItems: 'flex-start' }}>
              <div>
                <div className="lp-qr-frame" style={{ borderColor: `var(--lp-${current.color})` }}>
                  <QRCanvas value={url} size={220} color="#0A0B14" bg="#FFFFFF" radius={16}/>
                </div>
                <div className="lp-flex" style={{ gap: 8, marginTop: 12, justifyContent: 'center' }}>
                  <Btn icon="download" size="sm">PNG</Btn>
                  <Btn icon="download" size="sm">PDF</Btn>
                  <Btn icon="download" size="sm">SVG</Btn>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lp-flex lp-flex-between" style={{ marginBottom: 6 }}>
                  <h2 className="lp-h2" style={{ fontSize: 22, margin: 0 }}>{current.name}</h2>
                  <Badge tone={current.status === 'live' ? 'success' : current.status === 'paused' ? 'warning' : 'neutral'} dot>{current.status}</Badge>
                </div>
                <div className="lp-flex" style={{ gap: 8, alignItems: 'center', marginBottom: 18 }}>
                  <span className="lp-link-pill"><Icon name="link" size={12}/> {current.url}</span>
                  <Btn variant="ghost" size="sm" icon="copy"/>
                  <Btn variant="ghost" size="sm" icon="external"/>
                </div>
                <div className="lp-grid lp-grid-3" style={{ gap: 10, marginBottom: 18 }}>
                  <MicroStat label="Total scans" value={current.scans} icon="qr"/>
                  <MicroStat label="Conversion" value={Math.round(current.conv * 100)} suffix="%" icon="trendUp" tone="success"/>
                  <MicroStat label="Avg. daily" value={Math.round(current.scans / 30)} icon="bars" tone="violet"/>
                </div>
                <CardHeader title="Last 14 days" subtitle="Scans per day"/>
                <Chart
                  data={dayLabels(14).map((x, i) => ({ x, scans: Math.round(current.scans / 30 * (1 + Math.sin(i * 0.7) * 0.4 + Math.random() * 0.3)) }))}
                  keys={['scans']} colors={[current.color]} kind="area" height={170} yTicks={3}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Scan heatmap"
              subtitle="When customers scan — by day of week × hour"
              action={<Btn variant="ghost" size="sm" iconRight="chevronD">This month</Btn>}
            />
            <div className="lp-heat-wrap">
              <div className="lp-heat-y">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
              </div>
              <Heatmap rows={7} cols={24}
                data={Array.from({ length: 7 * 24 }, (_, i) => {
                  const day = Math.floor(i / 24), hr = i % 24;
                  const peak = (hr >= 11 && hr <= 14) || (hr >= 18 && hr <= 21);
                  const weekend = day >= 5;
                  return Math.round((peak ? 18 : 4) * (weekend ? 1.4 : 1) * (0.6 + Math.random() * 0.8));
                })}
                max={30}
                tone={current.color}
              />
            </div>
            <div className="lp-heat-x">
              {[0,6,12,18,23].map(h => <span key={h}>{h}:00</span>)}
            </div>
          </Card>
        </div>

        <div className="lp-stack" style={{ position: 'sticky', top: 12 }}>
          <Card padded={false}>
            <div style={{ padding: '16px 18px 6px' }}>
              <CardHeader title="Campaigns" subtitle={`${campaigns.length} total · ${campaigns.filter(c => c.status === 'live').length} live`}/>
            </div>
            <div className="lp-camp-list">
              {campaigns.map(c => (
                <button key={c.id} onClick={() => setSelected(c.id)} className={`lp-camp-row ${selected === c.id ? 'is-on' : ''}`}>
                  <div className="lp-camp-thumb" style={{ background: `var(--lp-${c.color}-soft)`, color: `var(--lp-${c.color})` }}>
                    <Icon name="qr" size={14}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lp-camp-name">{c.name}</div>
                    <div className="lp-muted lp-truncate" style={{ fontSize: 11 }}>{c.url}</div>
                  </div>
                  <div className="lp-camp-meta">
                    <div>{fmt(c.scans)}</div>
                    <div className="lp-muted" style={{ fontSize: 11 }}>{pct(c.conv)}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ padding: '10px 16px 16px' }}>
              <Btn variant="ghost" icon="plus" className="lp-block">Create campaign</Btn>
            </div>
          </Card>

          <Card>
            <CardHeader title="Dynamic QR" subtitle="One code, swappable destination"/>
            <Switch label="Dynamic redirect" sub="Change destination without reprinting" checked={true} onChange={() => {}}/>
            <Switch label="Pause campaign" sub="Customers see a friendly fallback" checked={false} onChange={() => {}}/>
            <Switch label="Enable A/B testing" sub="Split traffic between funnel variants" checked={false} onChange={() => {}}/>
          </Card>
        </div>
      </div>
    </div>
  );
}
