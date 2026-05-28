'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IconName } from '../ui';
import {
  Icon, Card, CardHeader, Btn, Stat, Chart,
  Ring, Heatmap, Progress, Counter, Select, fmt, pct,
} from '../ui';

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); });

// ── helpers ─────────────────────────────────────────────────

function countryFlag(iso: string): string {
  if (!iso || iso.length !== 2) return '🌐';
  return iso.toUpperCase().split('').map(
    c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65),
  ).join('');
}

function countryName(iso: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso.toUpperCase()) ?? iso;
  } catch { return iso; }
}

const DEVICE_META: Record<string, { icon: IconName; tone: string; label: string }> = {
  mobile:  { icon: 'smartphone', tone: 'primary', label: 'Mobile'  },
  desktop: { icon: 'monitor',    tone: 'violet',  label: 'Desktop' },
  tablet:  { icon: 'tablet',     tone: 'cyan',    label: 'Tablet'  },
};

// ── types ────────────────────────────────────────────────────

interface SummaryData {
  window_days:       number;
  totals:            Record<string, number>;
  daily_series:      { date: string; scan: number; generate: number; refresh: number; copy: number; redirect: number; complete: number; private_feedback: number }[];
  by_device:         Record<string, number>;
  by_country:        { country: string; count: number }[];
  by_hour:           number[];
  by_dow:            number[];
  draft_acceptance?: { first: number; second: number };
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

function SkeletonRow() {
  return (
    <div className="lp-grid lp-grid-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="lp-card" style={{ padding: 20, minHeight: 96 }}>
          <div style={{ width: 70, height: 11, background: 'var(--lp-border)', borderRadius: 4, marginBottom: 12 }} />
          <div style={{ width: 110, height: 26, background: 'var(--lp-border)', borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ── main component ───────────────────────────────────────────

export default function ScreenAnalytics() {
  const [days, setDays] = useState<'7d' | '30d' | '90d'>('30d');
  const daysNum = days === '7d' ? 7 : days === '90d' ? 90 : 30;

  const { data, isLoading, error, refetch } = useQuery<SummaryData>({
    queryKey: [`/api/analytics/summary?days=${daysNum}`],
    queryFn:  () => fetcher(`/api/analytics/summary?days=${daysNum}`),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const t = data?.totals ?? {};
  const scansTotal     = t['scan']     ?? 0;
  const refreshesTotal = t['refresh']  ?? 0;
  const generatesTotal = (t['generate'] ?? 0) + refreshesTotal;
  const copiesTotal    = t['copy']     ?? 0;
  const redirectsTotal = t['redirect'] ?? 0;
  const completesTotal = t['complete'] ?? 0;

  const draftFirst  = data?.draft_acceptance?.first  ?? 0;
  const draftSecond = data?.draft_acceptance?.second ?? 0;
  const draftTotal  = draftFirst + draftSecond || 1;

  // Derive sparkline arrays from daily_series
  const ds = data?.daily_series ?? [];
  const scansSpark     = ds.slice(-14).map(d => d.scan     ?? 0);
  const generatesSpark = ds.slice(-14).map(d => (d.generate ?? 0) + (d.refresh ?? 0));
  const refreshesSpark = ds.slice(-14).map(d => d.refresh  ?? 0);
  const copiesSpark    = ds.slice(-14).map(d => d.copy     ?? 0);
  const redirectsSpark = ds.slice(-14).map(d => d.redirect ?? 0);

  // Chart series
  const chartSeries = ds.map(d => ({
    x:         d.date.slice(5),
    scans:     d.scan     ?? 0,
    reviews:   d.generate ?? 0,
    redirects: d.redirect ?? 0,
  }));

  // Conversion rate
  const convRate = scansTotal > 0 ? Math.round((redirectsTotal / scansTotal) * 1000) / 10 : 0;
  const bestConvRate = convRate;

  // Device breakdown
  const deviceEntries = Object.entries(data?.by_device ?? {});
  const deviceTotal   = deviceEntries.reduce((s, [, n]) => s + n, 0);

  // Heatmap: approximate (dow × hour) distribution from marginals
  const byHour = data?.by_hour ?? Array(24).fill(0);
  const byDow  = data?.by_dow  ?? Array(7).fill(0);
  const totalEvts = byHour.reduce((a, b) => a + b, 0);
  const heatmapData = Array.from({ length: 7 * 24 }, (_, i) => {
    const hr  = i % 24;
    const dow = Math.floor(i / 24);
    if (totalEvts === 0) return 0;
    return Math.round(byDow[dow] * byHour[hr] / totalEvts);
  });
  const heatMax = Math.max(1, ...heatmapData);

  const daySelectOpts = [
    { value: '7d',  label: 'Last 7 days'  },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
  ];

  if (error) {
    return (
      <div className="lp-page">
        <PageHeader title="Analytics" sub="Customer review funnel, by the numbers" />
        <Card>
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
            <div style={{ marginBottom: 12 }}>Could not load analytics data.</div>
            <Btn variant="ghost" onClick={() => refetch()}>Retry</Btn>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="lp-page">
      <PageHeader
        title="Analytics"
        sub="Customer review funnel, by the numbers"
        actions={
          <>
            <Select
              value={days}
              onChange={v => setDays(v as typeof days)}
              options={daySelectOpts}
            />
            <Btn icon="download">Export</Btn>
          </>
        }
      />

      {/* KPI Stats */}
      {isLoading ? <SkeletonRow /> : (
        <div className="lp-grid lp-grid-5">
          <Stat label="QR scans"          icon="qr"       value={scansTotal}     sparkData={scansSpark}     tone="primary" />
          <Stat label="Reviews generated" icon="sparkles" value={generatesTotal} sparkData={generatesSpark} tone="violet" />
          <Stat label="Refreshes"         icon="refresh"  value={refreshesTotal} sparkData={refreshesSpark} tone="warning" />
          <Stat label="Copy clicks"       icon="copy"     value={copiesTotal}    sparkData={copiesSpark}    tone="cyan" />
          <Stat label="Google redirects"  icon="external" value={redirectsTotal} sparkData={redirectsSpark} tone="success" />
        </div>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader title="Funnel volume" subtitle="Daily scans, reviews and redirects" />
        <div className="lp-chart-legend">
          <span><i style={{ background: 'var(--lp-primary)' }} />Scans</span>
          <span><i style={{ background: 'var(--lp-violet)' }} />Reviews generated</span>
          <span><i style={{ background: 'var(--lp-success)' }} />Google redirects</span>
        </div>
        {chartSeries.length === 0
          ? <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>No data for this period</div>
          : <Chart data={chartSeries} keys={['scans', 'reviews', 'redirects']} colors={['primary', 'violet', 'success']} kind="area" height={280} />
        }
      </Card>

      {/* Funnel + Conversion */}
      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
        <Card>
          <CardHeader title="Customer funnel" subtitle="Where customers drop off" />
          <div className="lp-funnel-viz">
            {[
              { label: 'Scanned QR',          value: scansTotal,     color: 'primary' },
              { label: 'Got AI review',        value: generatesTotal, color: 'violet'  },
              { label: 'Copied review',        value: copiesTotal,    color: 'cyan'    },
              { label: 'Redirected to Google', value: redirectsTotal, color: 'warning' },
              { label: 'Completed funnel',     value: completesTotal, color: 'success' },
            ].map((s, _i, arr) => {
              const base  = arr[0].value || 1;
              const width = (s.value / base) * 100;
              return (
                <div className="lp-funnel-step" key={s.label}>
                  <div className="lp-funnel-step-label">
                    <span>{s.label}</span>
                    <span><b>{fmt(s.value)}</b> <span className="lp-muted">{pct(s.value / base)}</span></span>
                  </div>
                  <div className="lp-funnel-step-bar" style={{ width: `${width}%`, background: `var(--lp-${s.color})` }} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Conversion rate" subtitle="Scans → Google redirects" />
          <div className="lp-flex" style={{ justifyContent: 'center', padding: '12px 0' }}>
            <Ring value={convRate} max={100} size={140} stroke={12} tone="success"
              label={<span><Counter value={convRate} decimals={1} suffix="%" /></span>}
              sub="of all scans" />
          </div>
          <div className="lp-stack" style={{ gap: 8, marginTop: 8 }}>
            {[
              { label: 'Industry benchmark', val: '32%' },
              { label: 'Your best campaign', val: `${bestConvRate.toFixed(1)}%` },
            ].map(r => (
              <div key={r.label} className="lp-flex lp-flex-between" style={{ fontSize: 12 }}>
                <span className="lp-muted">{r.label}</span>
                <span>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Device + Country + Campaigns */}
      <div className="lp-grid lp-grid-3">
        <Card>
          <CardHeader title="Device breakdown" subtitle="Where customers scan from" />
          {deviceEntries.length === 0
            ? <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>No data yet</div>
            : (
              <div className="lp-device-list">
                {deviceEntries
                  .sort(([, a], [, b]) => b - a)
                  .map(([device, count], i) => {
                    const meta  = DEVICE_META[device] ?? { icon: 'smartphone' as IconName, tone: 'neutral', label: device };
                    const tones = ['primary', 'violet', 'cyan', 'success'];
                    const tone  = meta.tone ?? tones[i % tones.length];
                    const share = deviceTotal > 0 ? count / deviceTotal : 0;
                    return (
                      <div className="lp-device-row" key={device}>
                        <span className={`lp-device-icon lp-tone-${tone}`}><Icon name={meta.icon} size={14} /></span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
                            <span>{meta.label}</span>
                            <span><b>{pct(share)}</b></span>
                          </div>
                          <Progress value={share * 100} tone={tone} height={4} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
        </Card>

        <Card>
          <CardHeader title="Top countries" subtitle="By customer location" />
          {(data?.by_country ?? []).length === 0
            ? <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>No location data yet</div>
            : (
              <div className="lp-country-list">
                {(data?.by_country ?? []).map(c => {
                  const topCount = data!.by_country[0].count || 1;
                  return (
                    <div className="lp-country-row" key={c.country}>
                      <span className="lp-country-flag">{countryFlag(c.country)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
                          <span className="lp-truncate">{countryName(c.country)}</span>
                          <span>{fmt(c.count)}</span>
                        </div>
                        <Progress value={(c.count / topCount) * 100} tone="primary" height={4} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </Card>

        <Card>
          <CardHeader title="Event breakdown" subtitle="By type this period" />
          <div className="lp-stack" style={{ gap: 8 }}>
            {[
              { label: 'Scans',     val: scansTotal,     color: 'primary' },
              { label: 'Generates', val: generatesTotal, color: 'violet'  },
              { label: 'Copies',    val: copiesTotal,    color: 'cyan'    },
              { label: 'Redirects', val: redirectsTotal, color: 'warning' },
              { label: 'Completes', val: completesTotal, color: 'success' },
            ].map(c => {
              const max = scansTotal || 1;
              return (
                <div className="lp-camp-perf" key={c.label}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 13 }}>
                    <span><b>{c.label}</b></span>
                    <span style={{ color: `var(--lp-${c.color})` }}><b>{fmt(c.val)}</b></span>
                  </div>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 11, color: 'var(--lp-fg-muted)', marginBottom: 4 }}>
                    <span>{pct(c.val / max)} of scans</span>
                  </div>
                  <Progress value={c.val} max={max} tone={c.color} height={6} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader title="Scan activity by hour" subtitle="Aggregated across all campaigns this period" />
        <div className="lp-heat-wrap">
          <div className="lp-heat-y">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
          <Heatmap rows={7} cols={24} data={heatmapData} max={heatMax} tone="primary" />
        </div>
        <div className="lp-heat-x">
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}:00</span>)}
        </div>
      </Card>

      {/* Draft acceptance */}
      <Card>
        <CardHeader title="AI draft acceptance" subtitle="Which draft customers actually used" />
        <div className="lp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[
            { label: '1st Draft Used', value: draftFirst,  tone: 'primary', icon: 'sparkles' as const },
            { label: '2nd Draft Used', value: draftSecond, tone: 'violet',  icon: 'refresh'  as const },
          ].map(d => (
            <div key={d.label} className="lp-card" style={{ padding: 16 }}>
              <div className="lp-flex" style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <span className={`lp-device-icon lp-tone-${d.tone}`}><Icon name={d.icon} size={14} /></span>
                <span style={{ fontSize: 12, color: 'var(--lp-fg-muted)' }}>{d.label}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{fmt(d.value)}</div>
              <Progress value={(d.value / draftTotal) * 100} tone={d.tone} height={6} />
              <div style={{ fontSize: 11, color: 'var(--lp-fg-muted)', marginTop: 4 }}>{pct(d.value / draftTotal)} of copies</div>
            </div>
          ))}
        </div>
        {(draftFirst + draftSecond) === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13, padding: '8px 0' }}>
            No copy events yet — data appears once customers use the funnel
          </div>
        )}
      </Card>
    </div>
  );
}
