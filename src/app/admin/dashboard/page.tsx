'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { MdBusiness, MdCreditCard, MdAttachMoney, MdQrCode, MdAutoAwesome, MdStar } from 'react-icons/md';
import AdminTopbar from '../_components/shell/topbar';
import StatCard from '../_components/cards/stat-card';
import ChartCard from '../_components/cards/chart-card';
import type { DashboardStats, DashboardCharts, AuditLog } from '@/types/admin';
import StatusBadge from '../_components/badges/status-badge';

const adminFetch = <T,>(url: string): Promise<T> =>
  fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); });

const LineChart   = dynamic(() => import('../_components/charts/line-chart'),   { ssr: false, loading: () => <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });
const DonutChart  = dynamic(() => import('../_components/charts/donut-chart'),  { ssr: false, loading: () => <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });
const FunnelChart = dynamic(() => import('../_components/charts/funnel-chart'), { ssr: false, loading: () => <div style={{ height: 180, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/> });

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', height: 108 }}>
      <div style={{ height: 12, width: '60%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 12, animation: 'pulse 1.4s infinite' }}/>
      <div style={{ height: 28, width: '40%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 12, animation: 'pulse 1.4s infinite' }}/>
      <div style={{ height: 10, width: '30%', background: 'var(--surface-2)', borderRadius: 4, animation: 'pulse 1.4s infinite' }}/>
    </div>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('30d');

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-stats', dateRange],
    queryFn:  () => adminFetch('/api/admin/stats'),
    staleTime: 60_000,
  });

  const { data: charts, isLoading: chartsLoading } = useQuery<DashboardCharts>({
    queryKey: ['admin-stats-charts', dateRange],
    queryFn:  () => adminFetch('/api/admin/stats/charts'),
    staleTime: 60_000,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery<{ data: AuditLog[] }>({
    queryKey: ['admin-audit-logs-recent'],
    queryFn:  () => adminFetch('/api/admin/audit-logs?limit=20'),
    staleTime: 30_000,
  });

  const logs = logsData?.data ?? [];
  const loading = statsLoading || chartsLoading || logsLoading;

  const STAT_CARDS = stats ? [
    { label: 'Total Businesses',     value: stats.total_businesses.toLocaleString(),     delta: stats.total_businesses_delta,     icon: <MdBusiness size={18}/>,   hero: true },
    { label: 'Active Subscriptions', value: stats.active_subscriptions.toLocaleString(), delta: stats.active_subscriptions_delta, icon: <MdCreditCard size={18}/>  },
    { label: 'Paid Businesses',      value: stats.paid_businesses.toLocaleString(),      delta: stats.paid_businesses_delta,      icon: <MdAttachMoney size={18}/> },
    { label: 'Scans Today',          value: stats.scans_today.toLocaleString(),          delta: stats.scans_today_delta,          icon: <MdQrCode size={18}/>      },
    { label: 'Reviews Generated',    value: stats.reviews_today.toLocaleString(),        delta: stats.reviews_today_delta,        icon: <MdAutoAwesome size={18}/> },
    { label: 'Avg Copy Rate',        value: `${stats.avg_copy_rate}%`,                  delta: stats.avg_copy_rate_delta,        icon: <MdStar size={18}/>,       sublabel: 'copy / generate' },
  ] : null;

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .admin-stat-grid{display:grid;gap:12px;grid-template-columns:repeat(2,1fr)}
        @media(min-width:768px){.admin-stat-grid{grid-template-columns:repeat(3,1fr)}}
        @media(min-width:1280px){.admin-stat-grid{grid-template-columns:repeat(6,1fr)}}
        .admin-charts-row{display:grid;gap:16px;grid-template-columns:1fr}
        @media(min-width:1100px){.admin-charts-row{grid-template-columns:1.6fr 1fr}}
        .admin-bottom-row{display:grid;gap:16px;grid-template-columns:1fr}
        @media(min-width:1100px){.admin-bottom-row{grid-template-columns:1fr 1.4fr}}
      `}</style>
      <AdminTopbar
        breadcrumbs={['Admin', 'Dashboard']}
        pageTitle="Platform Overview"
        actions={
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden' }}>
            {(['7d', '30d', '90d'] as const).map(r => (
              <button key={r} onClick={() => setDateRange(r)} style={{
                padding: '5px 12px', fontSize: 12, fontWeight: 600,
                border: 'none', cursor: 'pointer', height: 30,
                background: dateRange === r ? 'var(--accent-soft)' : 'transparent',
                color: dateRange === r ? 'var(--accent-ink)' : 'var(--muted)',
              }}>{r}</button>
            ))}
          </div>
        }
      />

      <main style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Stat cards */}
        <div className="admin-stat-grid" style={{ marginBottom: 20 }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i}/>)
            : STAT_CARDS?.map((s, i) => (
                <StatCard key={i} label={s.label} value={s.value} delta={s.delta} icon={s.icon} hero={s.hero} sublabel={s.sublabel}/>
              ))
          }
        </div>

        {/* Charts row */}
        <div className="admin-charts-row" style={{ marginBottom: 20 }}>
          <ChartCard
            title="Daily scans · last 30 days"
            subtitle="QR scans across all businesses with reviews overlay"
          >
            {loading ? (
              <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/>
            ) : (
              <LineChart data={charts?.daily_scans ?? []} height={220}/>
            )}
          </ChartCard>

          <ChartCard title="Plan distribution" subtitle="Businesses by current subscription">
            {loading ? (
              <div style={{ height: 220, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/>
            ) : (
              <DonutChart data={charts?.plan_distribution ?? []} size={160}/>
            )}
          </ChartCard>
        </div>

        {/* Funnel + Activity */}
        <div className="admin-bottom-row">
          <ChartCard title="Event funnel" subtitle="scan → copy drop-off (30d)">
            {loading ? (
              <div style={{ height: 180, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.4s infinite' }}/>
            ) : (
              <FunnelChart data={charts?.event_funnel ?? []}/>
            )}
          </ChartCard>

          {/* Recent activity */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Recent admin activity</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Last 20 audit log entries</div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 320 }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, height: 12, background: 'var(--surface-2)', borderRadius: 4, animation: 'pulse 1.4s infinite' }}/>
                  </div>
                ))
              ) : logs.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No activity yet</div>
              ) : logs.map(log => (
                <div key={log.id} style={{
                  padding: '10px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <StatusBadge status={log.action}/>
                      <span style={{ color: 'var(--muted)' }}>by</span>
                      <span style={{ fontWeight: 500, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                        {log.actor_email ?? 'System'}
                      </span>
                    </div>
                    {log.target_type && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        {log.target_type} · {log.target_id?.slice(0, 8)}
                      </div>
                    )}
                  </div>
                  <div style={{ color: 'var(--muted-2)', fontSize: 11, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {fmtDate(log.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
