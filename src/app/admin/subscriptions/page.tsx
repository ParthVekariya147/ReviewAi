'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdSearch, MdArrowForward } from 'react-icons/md';
import AdminTopbar from '../_components/shell/topbar';
import DataTable, { type Column } from '../_components/tables/data-table';
import PlanBadge from '../_components/badges/plan-badge';
import StatusBadge from '../_components/badges/status-badge';
import type { AdminSubscription, Plan } from '@/types/admin';

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtMoney(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

type Summary = { mrr: number; churn_risk: number; past_due: number; plan_counts: Record<string, number> };

export default function SubscriptionsPage() {
  const [rows, setRows] = useState<AdminSubscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setFetchError(false);
    const sp = new URLSearchParams({ page: String(page), sort: sortKey, dir: sortDir });
    if (search)       sp.set('q', search);
    if (planFilter)   sp.set('plan', planFilter);
    if (statusFilter) sp.set('status', statusFilter);

    fetch(`/api/admin/subscriptions?${sp}`, { signal })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed')))
      .then(json => { setRows(json.data); setTotal(json.total); setSummary(json.summary); setLoading(false); })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setFetchError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [page, search, planFilter, statusFilter, sortKey, sortDir, retryKey]);

  function handleSort(key: string) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }

  const columns: Column<AdminSubscription>[] = [
    {
      key: 'business_name', header: 'Business', sortable: false, width: '200px',
      render: s => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{s.business_name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.owner_email}</div>
        </div>
      ),
    },
    { key: 'plan',   header: 'Plan',   sortable: true, width: '100px', render: s => <PlanBadge plan={s.plan as Plan}/> },
    { key: 'status', header: 'Status', sortable: true, width: '110px', render: s => <StatusBadge status={s.status}/> },
    { key: 'provider', header: 'Provider', width: '100px', render: s => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.provider ?? '—'}</span> },
    { key: 'current_period_end', header: 'Period End', sortable: true, width: '120px', render: s => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(s.current_period_end)}</span> },
    {
      key: 'cancel_at_end', header: 'Cancel', width: '80px',
      render: s => <span style={{ fontSize: 12, color: s.cancel_at_end ? '#991B1B' : 'var(--muted-2)' }}>{s.cancel_at_end ? 'Yes' : '—'}</span>,
    },
    { key: 'created_at', header: 'Created', sortable: true, width: '120px', render: s => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(s.created_at)}</span> },
    {
      key: 'actions', header: 'Actions', width: '80px',
      render: s => (
        <Link href={`/admin/businesses/${s.business_id}`} style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          View <MdArrowForward size={12}/>
        </Link>
      ),
    },
  ];

  const totalPages = Math.ceil(total / 25);

  return (
    <>
      <AdminTopbar breadcrumbs={['Admin', 'Subscriptions']} pageTitle="Subscriptions & Billing"/>

      <main style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        {fetchError && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1 }}>Failed to load subscriptions data.</span>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid #FECACA', background: '#fff', color: '#991B1B', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Retry
            </button>
          </div>
        )}
        {/* MRR Summary bar */}
        {summary && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Est. MRR',     value: fmtMoney(summary.mrr),            color: 'var(--ink)' },
              { label: 'Churn risk',   value: summary.churn_risk,               color: '#92400E' },
              { label: 'Past due',     value: summary.past_due,                 color: '#991B1B' },
              { label: 'Free',         value: summary.plan_counts['free'] ?? 0, color: 'var(--muted)' },
              { label: 'Starter',      value: summary.plan_counts['starter'] ?? 0, color: '#1D4ED8' },
              { label: 'Pro',          value: summary.plan_counts['pro'] ?? 0,  color: 'var(--accent-ink)' },
              { label: 'Enterprise',   value: summary.plan_counts['enterprise'] ?? 0, color: '#2F7DFB' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 320 }}>
            <MdSearch size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search business…"
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, boxSizing: 'border-box' }}/>
          </div>
          <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
            style={{ padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer' }}>
            <option value="">All plans</option>
            {['free', 'starter', 'pro', 'enterprise'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer' }}>
            <option value="">All statuses</option>
            {['active', 'canceled', 'past_due', 'trialing'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <DataTable columns={columns} rows={rows} getRowKey={s => s.id} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} loading={loading} emptyMessage="No subscriptions match your filters."/>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Page {page} of {totalPages} · {total} results</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
