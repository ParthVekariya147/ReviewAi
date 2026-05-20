'use client';

import type { IconName } from '../ui';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Chart, Ring, Heatmap, Progress, Counter, Select, fmt, pct, genSeries, dayLabels } from '../ui';

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

export default function ScreenAnalytics() {
  const days = dayLabels(30);
  const scans = genSeries(30, 220, 0.35, 0.45);
  const reviews = genSeries(30, 75, 0.4, 0.5);
  const redirects = genSeries(30, 55, 0.4, 0.55);
  const copies = genSeries(30, 38, 0.5, 0.3);
  const refreshes = genSeries(30, 22, 0.6, 0.4);
  const seriesMain = days.map((x, i) => ({ x, scans: scans[i], reviews: reviews[i], redirects: redirects[i] }));

  return (
    <div className="lp-page">
      <PageHeader
        title="Analytics"
        sub="Customer review funnel, by the numbers"
        actions={
          <>
            <Select value="30d" onChange={() => {}} options={[
              {value:'7d',label:'Last 7 days'},{value:'30d',label:'Last 30 days'},{value:'90d',label:'Last 90 days'},
            ]}/>
            <Btn icon="download">Export</Btn>
          </>
        }
      />

      <div className="lp-grid lp-grid-5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <Stat label="QR scans"          icon="qr"       value={scans.reduce((a,b)=>a+b,0)}     delta={12.4} sparkData={scans.slice(-14)}     tone="primary"/>
        <Stat label="Reviews generated" icon="sparkles" value={reviews.reduce((a,b)=>a+b,0)}   delta={8.2}  sparkData={reviews.slice(-14)}   tone="violet"/>
        <Stat label="Refreshes"         icon="refresh"  value={refreshes.reduce((a,b)=>a+b,0)} delta={-1.4} sparkData={refreshes.slice(-14)} tone="warning"/>
        <Stat label="Copy clicks"       icon="copy"     value={copies.reduce((a,b)=>a+b,0)}    delta={6.1}  sparkData={copies.slice(-14)}    tone="cyan"/>
        <Stat label="Google redirects"  icon="external" value={redirects.reduce((a,b)=>a+b,0)} delta={9.3}  sparkData={redirects.slice(-14)} tone="success"/>
      </div>

      <Card>
        <CardHeader title="Funnel volume" subtitle="Daily scans, reviews and redirects"/>
        <div className="lp-chart-legend">
          <span><i style={{ background: 'var(--lp-primary)' }}/>Scans</span>
          <span><i style={{ background: 'var(--lp-violet)' }}/>Reviews generated</span>
          <span><i style={{ background: 'var(--lp-success)' }}/>Google redirects</span>
        </div>
        <Chart data={seriesMain} keys={['scans','reviews','redirects']} colors={['primary','violet','success']} kind="area" height={280}/>
      </Card>

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
        <Card>
          <CardHeader title="Customer funnel" subtitle="Where customers drop off"/>
          <div className="lp-funnel-viz">
            {[
              {label:'Scanned QR',          value:6580, color:'primary'},
              {label:'Started funnel',       value:5921, color:'violet'},
              {label:'Saw AI suggestion',    value:4855, color:'cyan'},
              {label:'Copied review',        value:3922, color:'warning'},
              {label:'Redirected to Google', value:3284, color:'success'},
            ].map((s, i, arr) => {
              const width = (s.value / arr[0].value) * 100;
              return (
                <div className="lp-funnel-step" key={s.label}>
                  <div className="lp-funnel-step-label">
                    <span>{s.label}</span>
                    <span><b>{fmt(s.value)}</b> <span className="lp-muted">{pct(s.value / arr[0].value)}</span></span>
                  </div>
                  <div className="lp-funnel-step-bar" style={{ width: `${width}%`, background: `var(--lp-${s.color})` }}/>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Conversion rate" subtitle="Scans → Google redirects"/>
          <div className="lp-flex" style={{ justifyContent: 'center', padding: '12px 0' }}>
            <Ring value={49.9} max={100} size={140} stroke={12} tone="success"
                  label={<span><Counter value={49.9} decimals={1} suffix="%"/></span>}
                  sub="of all scans"/>
          </div>
          <div className="lp-stack" style={{ gap: 8, marginTop: 8 }}>
            {[
              {label:'Industry benchmark', val:'32%'},
              {label:'Your best campaign', val:'61%'},
              {label:'Trend (30d)', val:'↑ 5.4%', color:'success'},
            ].map(r => (
              <div key={r.label} className="lp-flex lp-flex-between" style={{ fontSize: 12 }}>
                <span className="lp-muted">{r.label}</span>
                <span style={r.color ? {color:`var(--lp-${r.color})`} : {}}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="lp-grid lp-grid-3">
        <Card>
          <CardHeader title="Device breakdown" subtitle="Where customers scan from"/>
          <div className="lp-device-list">
            {[
              {name:'iPhone',  share:0.58, icon:'smartphone', tone:'primary'},
              {name:'Android', share:0.34, icon:'smartphone', tone:'violet'},
              {name:'iPad',    share:0.05, icon:'tablet',     tone:'cyan'},
              {name:'Desktop', share:0.03, icon:'monitor',    tone:'success'},
            ].map(d => (
              <div className="lp-device-row" key={d.name}>
                <span className={`lp-device-icon lp-tone-${d.tone}`}><Icon name={d.icon as IconName} size={14}/></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
                    <span>{d.name}</span>
                    <span><b>{pct(d.share)}</b></span>
                  </div>
                  <Progress value={d.share * 100} tone={d.tone} height={4}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Top countries" subtitle="By customer location"/>
          <div className="lp-country-list">
            {[
              {flag:'🇺🇸',name:'United States', scans:4821, share:0.73},
              {flag:'🇨🇦',name:'Canada',        scans:832,  share:0.13},
              {flag:'🇲🇽',name:'Mexico',        scans:412,  share:0.06},
              {flag:'🇬🇧',name:'United Kingdom',scans:289,  share:0.04},
              {flag:'🇩🇪',name:'Germany',       scans:121,  share:0.02},
            ].map(c => (
              <div className="lp-country-row" key={c.name}>
                <span className="lp-country-flag">{c.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
                    <span className="lp-truncate">{c.name}</span>
                    <span>{fmt(c.scans)}</span>
                  </div>
                  <Progress value={c.share * 100} tone="primary" height={4}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Top campaigns" subtitle="By conversion"/>
          <div className="lp-stack" style={{ gap: 8 }}>
            {[
              {name:'Front Counter', scans:1284, conv:0.61, color:'primary'},
              {name:'Table Tents',   scans:942,  conv:0.52, color:'violet'},
              {name:'Receipts',      scans:614,  conv:0.44, color:'cyan'},
              {name:'Loyalty Email', scans:211,  conv:0.32, color:'warning'},
            ].map(c => (
              <div className="lp-camp-perf" key={c.name}>
                <div className="lp-flex lp-flex-between" style={{ fontSize: 13 }}>
                  <span><b>{c.name}</b></span>
                  <span style={{ color:`var(--lp-${c.color})` }}><b>{pct(c.conv)}</b></span>
                </div>
                <div className="lp-flex lp-flex-between" style={{ fontSize: 11, color:'var(--lp-fg-muted)', marginBottom: 4 }}>
                  <span>{fmt(c.scans)} scans</span>
                  <span>{Math.round(c.scans * c.conv)} redirects</span>
                </div>
                <Progress value={c.conv * 100} tone={c.color} height={6}/>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Scan activity by hour" subtitle="Aggregated across all campaigns this month"/>
        <div className="lp-heat-wrap">
          <div className="lp-heat-y">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
          <Heatmap rows={7} cols={24}
            data={Array.from({length: 7*24}, (_, i) => {
              const hr = i % 24, day = Math.floor(i / 24);
              const peak = (hr >= 11 && hr <= 14) || (hr >= 17 && hr <= 21);
              return Math.round((peak ? 22 : 5) * (day >= 5 ? 1.5 : 1) * (0.5 + Math.random()));
            })}
            max={40} tone="primary"
          />
        </div>
        <div className="lp-heat-x">
          {[0,6,12,18,23].map(h => <span key={h}>{h}:00</span>)}
        </div>
      </Card>

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
        <Card>
          <CardHeader title="Revenue contribution" subtitle="Estimated lift from new Google reviews"
            action={<Badge tone="success" icon="trendUp">+18.4% this month</Badge>}/>
          <div className="lp-grid lp-grid-3" style={{ gap: 14, marginBottom: 14 }}>
            {[
              {icon:'star',    label:'Avg. rating lift',    val:'+0.4 ★',  sub:'4.2 → 4.6 since launch'},
              {icon:'eye',     label:'Search impressions',  val:'+34%',     sub:'local-pack visibility'},
              {icon:'card',    label:'Est. revenue lift',   val:'$8,420',   sub:'industry model, last 30d'},
            ].map(m => (
              <div key={m.label} className="lp-microstat">
                <div className="lp-microstat-label"><Icon name={m.icon as IconName} size={12}/> {m.label}</div>
                <div className="lp-microstat-val">{m.val}</div>
                <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>{m.sub}</div>
              </div>
            ))}
          </div>
          <Chart
            data={['Jan','Feb','Mar','Apr','May'].map((x, i) => ({ x, revenue:[3200,4100,5400,6900,8420][i] }))}
            keys={['revenue']} colors={['success']} kind="area" height={140} yTicks={3}
            formatY={(v) => `$${(v/1000).toFixed(1)}k`}
          />
        </Card>

        <Card>
          <CardHeader title="Subscription utilization" subtitle="Pro plan · this month"/>
          <div className="lp-flex" style={{ justifyContent: 'center', padding: '4px 0 14px' }}>
            <Ring value={51.4} max={100} size={120} stroke={11} tone="primary"
                  label={<span><Counter value={51.4} decimals={1} suffix="%"/></span>}
                  sub="of quota"/>
          </div>
          <div className="lp-stack" style={{ gap: 10 }}>
            {[
              {label:'Reviews',   val:1284, max:2500,  tone:'primary'},
              {label:'Campaigns', val:4,    max:10,    tone:'violet'},
              {label:'Locations', val:2,    max:5,     tone:'cyan'},
            ].map(r => (
              <div key={r.label}>
                <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5, marginBottom: 4 }}>
                  <span className="lp-muted">{r.label}</span>
                  <span><b>{r.val}</b> <span className="lp-muted">/ {r.max}</span></span>
                </div>
                <Progress value={r.val} max={r.max} tone={r.tone} height={5}/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
