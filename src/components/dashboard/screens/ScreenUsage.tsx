'use client';

import useSWR from 'swr';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Ring, Chart, Progress, Counter, Switch, fmt } from '../ui';

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); });

// ── types ─────────────────────────────────────────────────────

interface UsageData {
  plan:            string;
  period_start:    string;
  period_end:      string;
  days_remaining:  number;
  days_elapsed:    number;
  projected_total: number;
  avg_per_day:     number;
  limits: { reviews: number; scans: number; campaigns: number };
  used:   { reviews: number; scans: number; campaigns: number };
  daily_series: { date: string; count: number }[];
  by_campaign:  { qr_id: string; campaign_name: string; count: number }[];
}

// ── helpers ───────────────────────────────────────────────────

function usagePct(used: number, max: number): number {
  if (max === -1) return 0;          // unlimited
  if (max === 0)  return 0;
  return Math.min(100, (used / max) * 100);
}

function limitLabel(max: number): string {
  return max === -1 ? '∞' : fmt(max);
}

function planTone(plan: string): string {
  switch (plan) {
    case 'pro':        return 'primary';
    case 'starter':    return 'violet';
    case 'enterprise': return 'success';
    default:           return 'neutral';
  }
}

function overageTone(pct: number): string {
  if (pct >= 90) return 'danger';
  if (pct >= 75) return 'warning';
  return 'success';
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

function FeatureRow({ label, icon, used, max, tone }: {
  label: string; icon: string; used: number; max: number; tone: string;
}) {
  const pct = usagePct(used, max);
  return (
    <div>
      <div className="lp-flex lp-flex-between" style={{ marginBottom: 6, fontSize: 12.5 }}>
        <span className="lp-flex" style={{ gap: 6, alignItems: 'center' }}>
          <Icon name={icon as never} size={13} style={{ color: `var(--lp-${tone})` }} />
          <span style={{ color: 'var(--lp-fg-muted)' }}>{label}</span>
        </span>
        <span>
          <b>{fmt(used)}</b>{' '}
          <span className="lp-muted">/ {limitLabel(max)} · {max === -1 ? '∞' : `${pct.toFixed(0)}%`}</span>
        </span>
      </div>
      <Progress value={used} max={max === -1 ? 1 : max} tone={tone} />
    </div>
  );
}

// ── main component ────────────────────────────────────────────

export default function ScreenUsage() {
  const { data, isLoading } = useSWR<UsageData>('/api/billing/usage', fetcher, {
    refreshInterval: 120_000,
  });

  if (isLoading || !data) {
    return (
      <div className="lp-page">
        <PageHeader title="Usage" sub="Track quota consumption across reviews, scans and AI calls" />
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
          Loading usage data…
        </div>
      </div>
    );
  }

  const { limits, used, daily_series, by_campaign } = data;

  const reviewsPct    = usagePct(used.reviews,   limits.reviews);
  const scansPct      = usagePct(used.scans,      limits.scans);
  const campaignsPct  = usagePct(used.campaigns,  limits.campaigns);
  const overallPct    = reviewsPct; // reviews is the primary quota signal

  // Period label for header
  const periodLabel = new Date(data.period_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Chart series
  const chartSeries = daily_series.map(d => ({ x: d.date.slice(5), used: d.count }));

  // Max campaign count for the per-campaign bar chart
  const maxCampaignCount = Math.max(1, ...by_campaign.map(c => c.count));

  const TONES = ['primary', 'violet', 'cyan', 'warning', 'success'] as const;

  return (
    <div className="lp-page">
      <PageHeader
        title="Usage"
        sub="Track quota consumption across reviews, scans and AI calls"
        actions={
          <Badge tone={planTone(data.plan) as 'primary' | 'violet' | 'success' | 'neutral'}>
            {data.plan.charAt(0).toUpperCase() + data.plan.slice(1)} plan
          </Badge>
        }
      />

      {/* Quota overview cards */}
      <div className="lp-grid lp-grid-4">
        <Card>
          <div className="lp-flex" style={{ justifyContent: 'center', padding: '8px 0' }}>
            <Ring
              value={overallPct} max={100} size={130} stroke={11}
              tone={overageTone(overallPct) as 'primary' | 'success' | 'warning'}
              label={<span><Counter value={overallPct} decimals={1} suffix="%" /></span>}
              sub={`${data.plan} quota`}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="lp-muted" style={{ fontSize: 12 }}>Reviews this cycle</div>
            <div>
              <b>{fmt(used.reviews)}</b>
              <span className="lp-muted"> / {limitLabel(limits.reviews)}</span>
            </div>
          </div>
        </Card>

        <Stat
          label="Days remaining"
          icon="history"
          value={data.days_remaining}
          suffix=" days"
          tone="violet"
        />
        <Stat
          label="Projected total"
          icon="trendUp"
          value={data.projected_total}
          tone={data.projected_total > limits.reviews && limits.reviews !== -1 ? 'warning' : 'cyan'}
        />
        <Stat
          label="Avg / day"
          icon="bars"
          value={data.avg_per_day}
          tone="cyan"
        />
      </div>

      {/* Daily chart */}
      <Card>
        <CardHeader
          title="Daily AI review generations"
          subtitle={`Each customer review counts toward your ${periodLabel} quota`}
          action={
            <Badge
              tone={overageTone(overallPct) as 'success' | 'warning' | 'danger'}
              icon="zap"
            >
              {overallPct >= 90 ? 'Near limit' : overallPct >= 75 ? 'Monitor' : 'On track'}
            </Badge>
          }
        />
        {chartSeries.length === 0 ? (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
            No reviews generated this period yet
          </div>
        ) : (
          <Chart data={chartSeries} keys={['used']} colors={['primary']} kind="bar" height={240} />
        )}
      </Card>

      {/* By feature + by campaign */}
      <div className="lp-grid lp-grid-2">
        <Card>
          <CardHeader title="By feature" subtitle="Where your quota is going" />
          <div className="lp-stack" style={{ gap: 14, marginTop: 10 }}>
            <FeatureRow label="AI review suggestions" icon="sparkles" used={used.reviews}   max={limits.reviews}   tone="primary" />
            <FeatureRow label="QR scans tracked"      icon="qr"       used={used.scans}     max={limits.scans}     tone="violet"  />
            <FeatureRow label="Active campaigns"       icon="funnel"   used={used.campaigns} max={limits.campaigns} tone="cyan"    />
          </div>
        </Card>

        <Card>
          <CardHeader title="By campaign" subtitle="Reviews generated per QR campaign this period" />
          {by_campaign.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
              No campaign data yet
            </div>
          ) : (
            <div className="lp-stack" style={{ gap: 12, marginTop: 10 }}>
              {by_campaign.map((c, i) => (
                <div key={c.qr_id} className="lp-flex" style={{ alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 130, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.campaign_name}
                  </span>
                  <div style={{ flex: 1 }}>
                    <Progress value={c.count} max={maxCampaignCount} tone={TONES[i % TONES.length]} height={8} />
                  </div>
                  <span style={{ width: 50, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                    <b>{fmt(c.count)}</b>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quota alerts (static — wired in Module 7 billing) */}
      <Card>
        <CardHeader title="Quota alerts" action={<Btn variant="ghost" size="sm" icon="plus">Add alert</Btn>} />
        <div className="lp-stack" style={{ gap: 10 }}>
          {[
            { threshold: '75%',  channel: 'Email',                      state: true  },
            { threshold: '90%',  channel: 'Email + SMS',                state: true  },
            { threshold: '100%', channel: 'All channels + auto-upgrade', state: false },
          ].map((a, i) => (
            <div className="lp-alert-row" key={i}>
              <div className="lp-flex" style={{ gap: 12, alignItems: 'center' }}>
                <span className="lp-alert-icon"><Icon name="bell" size={14} /></span>
                <div>
                  <div><b>Notify at {a.threshold}</b> of monthly quota</div>
                  <div className="lp-muted" style={{ fontSize: 12 }}>{a.channel}</div>
                </div>
              </div>
              <Switch checked={a.state} onChange={() => {}} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
