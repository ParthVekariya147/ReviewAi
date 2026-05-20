'use client';

import { Icon, Card, CardHeader, Btn, Badge, Stat, Ring, Chart, Progress, Counter, Switch, Select, fmt, genSeries, dayLabels } from '../ui';

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

export default function ScreenUsage() {
  const days = dayLabels(30);
  const usage = genSeries(30, 42, 0.4, 0.5);

  return (
    <div className="lp-page">
      <PageHeader
        title="Usage"
        sub="Track quota consumption across reviews, scans and AI calls"
        actions={
          <Select value="current" onChange={() => {}} options={[
            {value:'current',label:'May 2026 (current)'},
            {value:'prev',label:'April 2026'},
            {value:'ytd',label:'Year to date'},
          ]}/>
        }
      />

      <div className="lp-grid lp-grid-4">
        <Card>
          <div className="lp-flex" style={{ justifyContent: 'center', padding: '8px 0' }}>
            <Ring value={51.4} max={100} size={130} stroke={11} tone="primary"
                  label={<span><Counter value={51.4} decimals={1} suffix="%"/></span>}
                  sub="Pro quota"/>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="lp-muted">Reviews this cycle</div>
            <div><b>1,284</b> / 2,500</div>
          </div>
        </Card>
        <Stat label="Days remaining"  icon="history"  value={12}   suffix=" days" tone="violet"/>
        <Stat label="Projected total" icon="trendUp"  value={2680} delta={7.2}    tone="warning"/>
        <Stat label="Avg / day"       icon="bars"     value={61}   delta={4.2}    tone="cyan"/>
      </div>

      <Card>
        <CardHeader
          title="Daily AI review generations"
          subtitle="Each customer review counts toward your monthly quota"
          action={<Badge tone="warning" icon="zap">On track</Badge>}
        />
        <Chart
          data={days.map((x, i) => ({ x, used: usage[i] }))}
          keys={['used']} colors={['primary']} kind="bar" height={240}
        />
      </Card>

      <div className="lp-grid lp-grid-2">
        <Card>
          <CardHeader title="By feature" subtitle="Where your quota is going"/>
          <div className="lp-stack" style={{ gap: 14, marginTop: 10 }}>
            {([
              {label:'AI review suggestions', used:1284, max:2500,  tone:'primary', icon:'sparkles'},
              {label:'Refresh requests',      used:487,  max:1000,  tone:'violet',  icon:'refresh'},
              {label:'Translation calls',     used:142,  max:500,   tone:'cyan',    icon:'globe'},
              {label:'Funnel page views',     used:3420, max:10000, tone:'success', icon:'eye'},
              {label:'QR scans tracked',      used:3050, max:10000, tone:'warning', icon:'qr'},
            ] as const).map(f => {
              const pct = (f.used / f.max) * 100;
              return (
                <div key={f.label}>
                  <div className="lp-flex lp-flex-between" style={{ marginBottom: 6, fontSize: 12.5 }}>
                    <span className="lp-flex" style={{ gap: 6 }}>
                      <Icon name={f.icon} size={13} style={{ color: `var(--lp-${f.tone})` }}/>
                      <span style={{ color: 'var(--lp-fg-muted)' }}>{f.label}</span>
                    </span>
                    <span><b>{fmt(f.used)}</b> <span className="lp-muted">/ {fmt(f.max)} · {pct.toFixed(0)}%</span></span>
                  </div>
                  <Progress value={f.used} max={f.max} tone={f.tone}/>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="By campaign" subtitle="Quota consumption per QR campaign"/>
          <div className="lp-stack" style={{ gap: 12, marginTop: 10 }}>
            {[
              {name:'Front Counter', used:542, tone:'primary'},
              {name:'Table Tents',   used:388, tone:'violet'},
              {name:'Receipts',      used:241, tone:'cyan'},
              {name:'Loyalty Email', used:88,  tone:'warning'},
              {name:'Patio Event',   used:25,  tone:'success'},
            ].map(c => (
              <div key={c.name} className="lp-flex" style={{ alignItems: 'center', gap: 10 }}>
                <span style={{ width: 130, fontSize: 13 }}>{c.name}</span>
                <div style={{ flex: 1 }}><Progress value={c.used} max={600} tone={c.tone} height={8}/></div>
                <span style={{ width: 60, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}><b>{c.used}</b></span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Quota alerts" action={<Btn variant="ghost" size="sm" icon="plus">Add alert</Btn>}/>
        <div className="lp-stack" style={{ gap: 10 }}>
          {[
            {threshold:'75%',  channel:'Email',                     state:true},
            {threshold:'90%',  channel:'Email + SMS',               state:true},
            {threshold:'100%', channel:'All channels + auto-upgrade', state:false},
          ].map((a, i) => (
            <div className="lp-alert-row" key={i}>
              <div className="lp-flex" style={{ gap: 12, alignItems: 'center' }}>
                <span className="lp-alert-icon"><Icon name="bell" size={14}/></span>
                <div>
                  <div><b>Notify at {a.threshold}</b> of monthly quota</div>
                  <div className="lp-muted" style={{ fontSize: 12 }}>{a.channel}</div>
                </div>
              </div>
              <Switch checked={a.state} onChange={() => {}}/>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
