'use client';

import { useRouter } from 'next/navigation';
import type { IconName } from '../ui';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Chart, Sparkline, Progress, Counter, Select, fmt, pct, genSeries, dayLabels } from '../ui';

const BASE = '/app/business_dashboard';

interface PageHeaderProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

function PageHeader({ title, sub, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="lp-page-hd">
      <div>
        {eyebrow && <div className="lp-eyebrow">{eyebrow}</div>}
        <h1 className="lp-h1">{title}</h1>
        {sub && <div className="lp-page-sub">{sub}</div>}
      </div>
      {actions && <div className="lp-page-act">{actions}</div>}
    </div>
  );
}

function UsageRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  return (
    <div>
      <div className="lp-flex lp-flex-between" style={{ marginBottom: 6, fontSize: 12.5 }}>
        <span style={{ color: 'var(--lp-fg-muted)' }}>{label}</span>
        <span><b>{fmt(value)}</b> <span className="lp-muted">/ {fmt(max)}</span></span>
      </div>
      <Progress value={value} max={max} tone={tone}/>
    </div>
  );
}

function QuickAction({ icon, title, sub, onClick, accent = 'primary' }: { icon: IconName; title: string; sub: string; onClick: () => void; accent?: string }) {
  return (
    <button className="lp-quick-btn" onClick={onClick}>
      <span className={`lp-quick-icon lp-tone-${accent}`}><Icon name={icon} size={18}/></span>
      <div>
        <div className="lp-quick-title">{title}</div>
        <div className="lp-quick-sub">{sub}</div>
      </div>
      <Icon name="chevron" size={15} className="lp-quick-chev"/>
    </button>
  );
}

interface ScreenDashboardProps {
  ownerName?: string;
  bizName?: string;
}

export default function ScreenDashboard({ ownerName = 'Maya', bizName = 'Olive & Pine Bistro' }: ScreenDashboardProps) {
  const router = useRouter();
  const days = dayLabels(30);
  const scans = genSeries(30, 220, 0.35, 0.4);
  const reviews = genSeries(30, 36, 0.4, 0.55);
  const redirects = genSeries(30, 22, 0.4, 0.5);
  const series = days.map((x, i) => ({ x, scans: scans[i], reviews: reviews[i], redirects: redirects[i] }));

  const totalScans = scans.reduce((a, b) => a + b, 0);
  const totalReviews = reviews.reduce((a, b) => a + b, 0);
  const totalRedirects = redirects.reduce((a, b) => a + b, 0);
  const conversion = totalRedirects / totalScans;

  const recent = [
    { who: 'Customer #4821', what: 'submitted a 5★ review', when: '2 min ago', icon: 'star', tone: 'success' },
    { who: 'QR · Front Counter', what: 'scanned 14 times', when: '8 min ago', icon: 'qr', tone: 'primary' },
    { who: 'Customer #4820', what: 'redirected to Google', what2: 'via funnel', when: '11 min ago', icon: 'external', tone: 'primary' },
    { who: 'Funnel A', what: 'conversion ↑ 4.2%', when: '32 min ago', icon: 'trendUp', tone: 'success' },
    { who: 'Customer #4815', what: 'refreshed AI suggestion 2×', when: '1 hr ago', icon: 'refresh', tone: 'neutral' },
    { who: 'QR · Table 6', what: 'scanned 3 times', when: '1 hr ago', icon: 'qr', tone: 'primary' },
  ];

  const campaigns = [
    { name: 'Front Counter', code: 'reevo.io/r/fc-2k4', scans: 1284, conv: 0.412, status: 'live' },
    { name: 'Table Tents',   code: 'reevo.io/r/tt-7j1', scans: 942,  conv: 0.387, status: 'live' },
    { name: 'Receipts',      code: 'reevo.io/r/rc-9m2', scans: 614,  conv: 0.341, status: 'live' },
    { name: 'Loyalty Email', code: 'reevo.io/r/le-4p8', scans: 211,  conv: 0.298, status: 'paused' },
  ];

  const tones = ['primary', 'violet', 'cyan', 'success'] as const;

  return (
    <div className="lp-page">
      <PageHeader
        title={`Welcome back, ${ownerName.split(' ')[0]}`}
        sub={`Here's how ${bizName} is performing — last 30 days`}
        actions={
          <>
            <Btn icon="qr" onClick={() => router.push(`${BASE}/qr-dashboard`)}>New QR campaign</Btn>
            <Btn variant="primary" icon="sparkles" onClick={() => router.push(`${BASE}/funnel-manager`)}>Open funnel</Btn>
          </>
        }
      />

      <div className="lp-grid lp-grid-4">
        <Stat label="QR scans"          icon="qr"       value={totalScans}            delta={12.4} sparkData={scans.slice(-12)}                           tone="primary"/>
        <Stat label="Reviews generated" icon="sparkles" value={totalReviews}           delta={8.2}  sparkData={reviews.slice(-12)}                         tone="violet"/>
        <Stat label="Google redirects"  icon="external" value={totalRedirects}         delta={5.7}  sparkData={redirects.slice(-12)}                       tone="cyan"/>
        <Stat label="Funnel conversion" icon="funnel"   value={Math.round(conversion * 1000) / 10} suffix="%" decimals={1} delta={2.1} sparkData={reviews.map((r, i) => r / scans[i])} tone="success"/>
      </div>

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16 }}>
        <Card>
          <CardHeader
            title="Funnel performance"
            subtitle="QR scans, reviews generated & redirects sent to Google"
            action={
              <div className="lp-flex" style={{ gap: 8 }}>
                <Select value="30d" onChange={() => {}}
                        options={[{value:'7d',label:'7 days'},{value:'30d',label:'30 days'},{value:'90d',label:'90 days'}]}/>
              </div>
            }
          />
          <div className="lp-chart-legend">
            <span><i style={{ background: 'var(--lp-primary)' }}/>Scans</span>
            <span><i style={{ background: 'var(--lp-violet)' }}/>Reviews</span>
            <span><i style={{ background: 'var(--lp-cyan)' }}/>Redirects</span>
          </div>
          <Chart data={series} keys={['scans','reviews','redirects']} colors={['primary','violet','cyan']} kind="area" height={260}/>
        </Card>

        <div className="lp-stack">
          <Card>
            <CardHeader title="Subscription usage" subtitle="Pro plan · resets Jun 1"/>
            <div className="lp-stack" style={{ gap: 14, marginTop: 4 }}>
              <UsageRow label="Reviews generated" value={1284}  max={2500}  tone="primary"/>
              <UsageRow label="QR scans tracked"  value={3050}  max={10000} tone="violet"/>
              <UsageRow label="Active campaigns"  value={4}     max={10}    tone="cyan"/>
            </div>
            <div className="lp-divider"/>
            <Btn variant="ghost" icon="card" iconRight="chevron" onClick={() => router.push(`${BASE}/billing`)} className="lp-block">
              Manage billing
            </Btn>
          </Card>

          <Card>
            <CardHeader title="Refresh & copy counts" subtitle="Customer engagement signals"/>
            <div className="lp-mini-stats">
              <div>
                <div className="lp-mini-label"><Icon name="refresh" size={12}/> Refreshes</div>
                <div className="lp-mini-value"><Counter value={487}/></div>
                <div className="lp-mini-sub">avg <b>1.4</b> per session</div>
              </div>
              <div>
                <div className="lp-mini-label"><Icon name="copy" size={12}/> Copy clicks</div>
                <div className="lp-mini-value"><Counter value={892}/></div>
                <div className="lp-mini-sub"><b>91%</b> of completed funnels</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }}>
        <Card padded={false}>
          <div style={{ padding: '18px 22px 0' }}>
            <CardHeader
              title="Active QR campaigns"
              subtitle="Top performing funnels right now"
              action={<Btn variant="ghost" iconRight="chevron" size="sm" onClick={() => router.push(`${BASE}/qr-dashboard`)}>View all</Btn>}
            />
          </div>
          <table className="lp-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th className="lp-num">Scans</th>
                <th className="lp-num">Conv.</th>
                <th>Trend</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={c.name}>
                  <td>
                    <div className="lp-tcell-main">
                      <div className="lp-qr-thumb" style={{ background: `linear-gradient(135deg, var(--lp-${tones[i]}) 0%, var(--lp-${tones[(i + 1) % 4]}) 100%)` }}>
                        <Icon name="qr" size={14}/>
                      </div>
                      <div>
                        <div className="lp-tcell-name">{c.name}</div>
                        <div className="lp-tcell-sub">{c.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="lp-num">{fmt(c.scans)}</td>
                  <td className="lp-num"><b>{pct(c.conv)}</b></td>
                  <td style={{ width: 100 }}>
                    <Sparkline data={genSeries(12, 100, 0.5, 0.4)} height={22} tone={tones[i]} fill={false}/>
                  </td>
                  <td><Badge tone={c.status === 'live' ? 'success' : 'neutral'} dot>{c.status}</Badge></td>
                  <td><Btn variant="ghost" icon="more" size="sm"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Recent activity" subtitle="Latest events from your funnel"/>
          <div className="lp-activity">
            {recent.map((r, i) => (
              <div className="lp-activity-row" key={i}>
                <span className={`lp-activity-icon lp-tone-${r.tone}`}><Icon name={r.icon as IconName} size={13}/></span>
                <div className="lp-activity-body">
                  <div><b>{r.who}</b> {r.what} {r.what2 && <span className="lp-muted">{r.what2}</span>}</div>
                  <div className="lp-activity-time">{r.when}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Quick actions"/>
        <div className="lp-quick">
          <QuickAction icon="qr"     title="Generate QR code"   sub="Download PNG or PDF"              onClick={() => router.push(`${BASE}/qr-dashboard`)}/>
          <QuickAction icon="funnel" title="Edit funnel"         sub="Customize the customer flow"      onClick={() => router.push(`${BASE}/funnel-manager`)} accent="violet"/>
          <QuickAction icon="bars"   title="View analytics"      sub="Drill into scan data"             onClick={() => router.push(`${BASE}/analytics`)} accent="cyan"/>
          <QuickAction icon="team"   title="Invite teammate"     sub="Give staff dashboard access"      onClick={() => router.push(`${BASE}/settings`)} accent="success"/>
        </div>
      </Card>
    </div>
  );
}
