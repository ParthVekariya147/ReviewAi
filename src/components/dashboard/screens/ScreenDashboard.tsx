'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { IconName } from '../ui';
import {
  Icon, Card, CardHeader, Btn, Badge, Stat, Chart,
  Counter, Select, fmt,
} from '../ui';

const BASE = '/app/business_dashboard';

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); });

// ── helpers ─────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function activityMeta(eventType: string): { icon: IconName; label: string; tone: string } {
  switch (eventType) {
    case 'scan':             return { icon: 'qr',       label: 'scanned a QR code',        tone: 'primary' };
    case 'generate':         return { icon: 'sparkles', label: 'generated an AI review',   tone: 'violet'  };
    case 'refresh':          return { icon: 'refresh',  label: 'refreshed AI suggestion',  tone: 'neutral' };
    case 'copy':             return { icon: 'copy',     label: 'copied the review',        tone: 'primary' };
    case 'redirect':         return { icon: 'external', label: 'redirected to Google',     tone: 'primary' };
    case 'complete':         return { icon: 'star',     label: 'submitted a 5★ review',    tone: 'success' };
    case 'private_feedback': return { icon: 'msg',      label: 'left private feedback',    tone: 'neutral' };
    default:                 return { icon: 'qr',       label: eventType,                  tone: 'neutral' };
  }
}

// ── sub-components ───────────────────────────────────────────

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


function QuickAction({ icon, title, sub, onClick, accent = 'primary' }: {
  icon: IconName; title: string; sub: string; onClick: () => void; accent?: string;
}) {
  return (
    <button className="lp-quick-btn" onClick={onClick}>
      <span className={`lp-quick-icon lp-tone-${accent}`}><Icon name={icon} size={18} /></span>
      <div>
        <div className="lp-quick-title">{title}</div>
        <div className="lp-quick-sub">{sub}</div>
      </div>
      <Icon name="chevron" size={15} className="lp-quick-chev" />
    </button>
  );
}

function SkeletonStat() {
  return (
    <div className="lp-card" style={{ padding: 20, minHeight: 100 }}>
      <div style={{ width: 80, height: 12, background: 'var(--lp-border)', borderRadius: 4, marginBottom: 12 }} />
      <div style={{ width: 120, height: 28, background: 'var(--lp-border)', borderRadius: 4 }} />
    </div>
  );
}

// ── main component ───────────────────────────────────────────

interface OverviewData {
  business:        { id: string; name: string; plan: string };
  kpis:            {
    scans: number; generates: number; redirects: number; completes: number;
    refreshes: number; copies: number; conversion: number;
    scans_delta: number | null; generates_delta: number | null;
    redirects_delta: number | null; completes_delta: number | null;
  };
  daily_series:    { date: string; scans: number; generates: number; redirects: number }[];
  campaigns:       { id: string; name: string; token: string; status: string; scans: number; completes: number; conversion: number }[];
  recent_activity: { event_type: string; qr_id: string; device: string; country: string; created_at: string }[];
}

export default function ScreenDashboard({ ownerName = 'User' }: { ownerName?: string }) {
  const router = useRouter();
  const { data, isLoading, error } = useQuery<OverviewData>({
    queryKey: ['/api/dashboard/overview'],
    queryFn:  () => fetcher('/api/dashboard/overview'),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="lp-page">
        <PageHeader title={`Welcome back, ${ownerName.split(' ')[0]}`} />
        <div className="lp-grid lp-grid-4">
          <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
        </div>
      </div>
    );
  }

  // Error / no business yet
  if (error || !data) {
    return (
      <div className="lp-page">
        <PageHeader title={`Welcome back, ${ownerName.split(' ')[0]}`} />
        <Card><div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
          Could not load dashboard data. Please refresh.
        </div></Card>
      </div>
    );
  }

  const { business, kpis, daily_series, campaigns, recent_activity } = data;

  // Derive sparkline arrays from the last 12 daily data points
  const scansSpark      = daily_series.slice(-12).map(d => d.scans);
  const generatesSpark  = daily_series.slice(-12).map(d => d.generates);
  const redirectsSpark  = daily_series.slice(-12).map(d => d.redirects);
  const conversionSpark = daily_series.slice(-12).map(d =>
    d.scans > 0 ? d.redirects / d.scans : 0,
  );

  // Chart series: rename fields to match Chart component keys
  const chartSeries = daily_series.map(d => ({
    x:         d.date.slice(5),   // MM-DD
    scans:     d.scans,
    reviews:   d.generates,
    redirects: d.redirects,
  }));

  const tones = ['primary', 'violet', 'cyan', 'success'] as const;

  return (
    <div className="lp-page">
      <PageHeader
        title={`Welcome back, ${ownerName.split(' ')[0]}`}
        sub={`Here's how ${business.name} is performing — last 30 days`}
        actions={
          <>
            <Btn icon="qr" onClick={() => router.push(`${BASE}/qr-dashboard`)}>New QR campaign</Btn>
            <Btn variant="primary" icon="sparkles" onClick={() => router.push(`${BASE}/funnel-manager`)}>Open funnel</Btn>
          </>
        }
      />

      {/* KPI Stats */}
      <div className="lp-grid lp-grid-4">
        <Stat label="QR scans"          icon="qr"       value={kpis.scans}      delta={kpis.scans_delta     ?? undefined} sparkData={scansSpark}      tone="primary" />
        <Stat label="Reviews generated" icon="sparkles" value={kpis.generates}  delta={kpis.generates_delta ?? undefined} sparkData={generatesSpark}  tone="violet" />
        <Stat label="Google redirects"  icon="external" value={kpis.redirects}  delta={kpis.redirects_delta ?? undefined} sparkData={redirectsSpark}  tone="cyan" />
        <Stat label="Funnel conversion" icon="funnel"   value={kpis.conversion} delta={kpis.completes_delta ?? undefined} sparkData={conversionSpark} tone="success" suffix="%" decimals={1} />
      </div>

      {/* Chart + Usage */}
      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16 }}>
        <Card>
          <CardHeader
            title="Funnel performance"
            subtitle="QR scans, reviews generated & redirects sent to Google"
            action={
              <Select value="30d" onChange={() => {}}
                options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }, { value: '90d', label: '90 days' }]} />
            }
          />
          <div className="lp-chart-legend">
            <span><i style={{ background: 'var(--lp-primary)' }} />Scans</span>
            <span><i style={{ background: 'var(--lp-violet)' }} />Reviews</span>
            <span><i style={{ background: 'var(--lp-cyan)' }} />Redirects</span>
          </div>
          <Chart data={chartSeries} keys={['scans', 'reviews', 'redirects']} colors={['primary', 'violet', 'cyan']} kind="area" height={260} />
        </Card>

        <div className="lp-stack">
          <Card>
            <CardHeader title="Refresh & copy counts" subtitle="Customer engagement signals" />
            <div className="lp-mini-stats">
              <div>
                <div className="lp-mini-label"><Icon name="refresh" size={12} /> Refreshes</div>
                <div className="lp-mini-value"><Counter value={kpis.refreshes} /></div>
              </div>
              <div>
                <div className="lp-mini-label"><Icon name="copy" size={12} /> Copy clicks</div>
                <div className="lp-mini-value"><Counter value={kpis.copies} /></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Campaigns + Activity */}
      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16 }}>
        <Card padded={false}>
          <div style={{ padding: '18px 22px 0' }}>
            <CardHeader
              title="Active QR campaigns"
              subtitle="Top performing funnels right now"
              action={<Btn variant="ghost" iconRight="chevron" size="sm" onClick={() => router.push(`${BASE}/qr-dashboard`)}>View all</Btn>}
            />
          </div>

          {campaigns.length === 0 ? (
            <div style={{ padding: '32px 22px', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
              No campaigns yet. <button className="lp-link" onClick={() => router.push(`${BASE}/qr-dashboard`)}>Create your first QR campaign →</button>
            </div>
          ) : (
            <table className="lp-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th className="lp-num">Scans</th>
                  <th className="lp-num">Conv.</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <div className="lp-tcell-main">
                        <div className="lp-qr-thumb" style={{ background: `linear-gradient(135deg, var(--lp-${tones[i % 4]}) 0%, var(--lp-${tones[(i + 1) % 4]}) 100%)` }}>
                          <Icon name="qr" size={14} />
                        </div>
                        <div>
                          <div className="lp-tcell-name">{c.name}</div>
                          <div className="lp-tcell-sub">reevo.io/r/{c.token}</div>
                        </div>
                      </div>
                    </td>
                    <td className="lp-num">{fmt(c.scans)}</td>
                    <td className="lp-num"><b>{c.conversion.toFixed(1)}%</b></td>
                    <td><Badge tone={c.status === 'live' ? 'success' : 'neutral'} dot>{c.status}</Badge></td>
                    <td><Btn variant="ghost" icon="more" size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent activity" subtitle="Latest events from your funnel" />
          {recent_activity.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
              No activity yet. Share a QR code to start collecting data.
            </div>
          ) : (
            <div className="lp-activity">
              {recent_activity.map((r, i) => {
                const { icon, label, tone } = activityMeta(r.event_type);
                return (
                  <div className="lp-activity-row" key={i}>
                    <span className={`lp-activity-icon lp-tone-${tone}`}><Icon name={icon} size={13} /></span>
                    <div className="lp-activity-body">
                      <div>Customer {label}</div>
                      <div className="lp-activity-time">{timeAgo(r.created_at)}{r.device ? ` · ${r.device}` : ''}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick actions" />
        <div className="lp-quick">
          <QuickAction icon="qr"     title="Generate QR code" sub="Download PNG or PDF"         onClick={() => router.push(`${BASE}/qr-dashboard`)} />
          <QuickAction icon="funnel" title="Edit funnel"       sub="Customize the customer flow" onClick={() => router.push(`${BASE}/funnel-manager`)} accent="violet" />
          <QuickAction icon="bars"   title="View analytics"    sub="Drill into scan data"        onClick={() => router.push(`${BASE}/analytics`)} accent="cyan" />
          <QuickAction icon="team"   title="Invite teammate"   sub="Give staff dashboard access" onClick={() => router.push(`${BASE}/settings`)} accent="success" />
        </div>
      </Card>
    </div>
  );
}
