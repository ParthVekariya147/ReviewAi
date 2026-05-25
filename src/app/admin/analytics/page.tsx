'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import AdminTopbar from '../_components/shell/topbar';
import StatCard from '../_components/cards/stat-card';
import ChartCard from '../_components/cards/chart-card';

const BarChart  = dynamic(() => import('../_components/charts/bar-chart'),  { ssr: false, loading: () => <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });
const DonutChart = dynamic(() => import('../_components/charts/donut-chart'), { ssr: false, loading: () => <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });

type AnalyticsData = {
  kpis: { total_scans: number; total_reviews: number; avg_copy_rate: number; avg_completion_rate: number; draft1_rate: number; draft2_rate: number };
  countries: { country: string; count: number }[];
  devices: { device: string; count: number }[];
  top_businesses: { id: string; name: string; scans: number }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setFetchError(false);
    fetch(`/api/admin/analytics?days=${days}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setFetchError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [days]);

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .analytics-kpi-grid{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
        @media(min-width:640px){.analytics-kpi-grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:1100px){.analytics-kpi-grid{grid-template-columns:repeat(6,1fr)}}
        .analytics-chart-row{display:grid;gap:16px;grid-template-columns:1fr}
        @media(min-width:900px){.analytics-chart-row{grid-template-columns:1fr 1fr}}
      `}</style>
      <AdminTopbar
        breadcrumbs={['Admin', 'Analytics']}
        pageTitle="Analytics"
        actions={
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden' }}>
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)} style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', height: 30,
                background: days === d ? 'var(--accent-soft)' : 'transparent',
                color: days === d ? 'var(--accent-ink)' : 'var(--muted)',
              }}>{d}d</button>
            ))}
          </div>
        }
      />

      <main style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        {fetchError && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: 13 }}>
            Failed to load analytics data. Please try again.
          </div>
        )}
        {/* KPI strip */}
        <div className="analytics-kpi-grid" style={{ marginBottom: 20 }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 88, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.4s infinite' }} />
            ))
          ) : [
            { label: 'Total Scans',       value: (data?.kpis.total_scans ?? 0).toLocaleString(), hero: true },
            { label: 'Reviews Generated', value: (data?.kpis.total_reviews ?? 0).toLocaleString() },
            { label: 'Avg Copy Rate',     value: `${data?.kpis.avg_copy_rate ?? 0}%` },
            { label: 'Completion Rate',   value: `${data?.kpis.avg_completion_rate ?? 0}%` },
            { label: 'Draft 1 rate',      value: `${data?.kpis.draft1_rate ?? 0}%` },
            { label: 'Draft 2 rate',      value: `${data?.kpis.draft2_rate ?? 0}%` },
          ].map((c, i) => <StatCard key={i} label={c.label} value={c.value} hero={c.hero} />)}
        </div>

        {/* Charts */}
        <div className="analytics-chart-row" style={{ marginBottom: 16 }}>
          <ChartCard title="Country distribution" subtitle={`Top 10 countries (${days}d)`}>
            {loading ? (
              <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }} />
            ) : (
              <BarChart
                data={(data?.countries ?? []).map(c => ({ label: c.country || 'Unknown', value: c.count }))}
                color="#6E5BFF"
              />
            )}
          </ChartCard>
          <ChartCard title="Device split" subtitle={`Mobile / tablet / desktop (${days}d)`}>
            {loading ? (
              <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }} />
            ) : (
              <DonutChart
                data={(data?.devices ?? []).map(d => ({ plan: d.device as 'free', count: d.count }))}
                size={160}
              />
            )}
          </ChartCard>
        </div>

        <ChartCard title="Top businesses by scans" subtitle={`Top 10 by scan volume (${days}d)`}>
          {loading ? (
            <div style={{ height: 200, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }} />
          ) : (
            <BarChart
              data={(data?.top_businesses ?? []).map(b => ({ label: b.name, value: b.scans }))}
              color="#2F7DFB"
            />
          )}
        </ChartCard>
      </main>
    </>
  );
}
