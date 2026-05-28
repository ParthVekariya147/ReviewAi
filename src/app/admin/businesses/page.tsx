'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MdSearch, MdFilterList, MdArrowForward } from 'react-icons/md';
import AdminTopbar from '../_components/shell/topbar';
import DataTable, { type Column } from '../_components/tables/data-table';
import PlanBadge from '../_components/badges/plan-badge';
import StatusBadge from '../_components/badges/status-badge';
import ConfirmActionModal from '../_components/modals/confirm-action-modal';
import type { AdminBusiness, Plan } from '@/types/admin';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

type SubRecord = { plan?: string; status?: string } | null;

export default function BusinessesPage() {
  const [rows, setRows] = useState<AdminBusiness[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [suspendTarget, setSuspendTarget] = useState<AdminBusiness | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspending, setSuspending] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    const sp = new URLSearchParams({ page: String(page), sort: sortKey, dir: sortDir });
    if (search)     sp.set('q', search);
    if (planFilter) sp.set('plan', planFilter);

    fetch(`/api/admin/businesses?${sp}`, { signal })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json) { setRows(json.data); setTotal(json.total); }
        setLoading(false);
      })
      .catch(err => { if (err.name !== 'AbortError') setLoading(false); });

    return () => controller.abort();
  }, [page, search, planFilter, sortKey, sortDir, refreshKey]);

  function handleSort(key: string) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  }

  async function confirmSuspend() {
    if (!suspendTarget) return;
    setSuspending(true);
    const isSuspended = !!suspendTarget.suspended_at;
    await fetch(`/api/admin/businesses/${suspendTarget.id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suspend: !isSuspended, reason: suspendReason }),
    });
    setSuspending(false);
    setSuspendTarget(null);
    setSuspendReason('');
    setRefreshKey(k => k + 1);
  }

  const columns: Column<AdminBusiness>[] = [
    {
      key: 'name', header: 'Business', sortable: true, width: '200px',
      render: b => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{b.name}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{b.owner_email}</div>
        </div>
      ),
    },
    {
      key: 'plan', header: 'Plan', sortable: true, width: '100px',
      render: b => {
        const sub = b.subscription as SubRecord;
        return <PlanBadge plan={(sub?.plan ?? b.plan) as Plan}/>;
      },
    },
    {
      key: 'status', header: 'Status', width: '110px',
      render: b => {
        if (b.suspended_at) return <StatusBadge status="suspended"/>;
        const sub = b.subscription as SubRecord;
        return <StatusBadge status={sub?.status ?? 'active'}/>;
      },
    },
    {
      key: 'qr_count', header: 'QR Campaigns', sortable: true, width: '120px',
      render: b => <span style={{ color: 'var(--ink-2)' }}>{b.qr_count}</span>,
    },
    {
      key: 'total_scans', header: 'Total Scans', sortable: true, width: '110px',
      render: b => <span style={{ color: 'var(--ink-2)' }}>{b.total_scans.toLocaleString()}</span>,
    },
    {
      key: 'created_at', header: 'Created', sortable: true, width: '120px',
      render: b => <span style={{ color: 'var(--muted)', fontSize: 12 }}>{fmtDate(b.created_at)}</span>,
    },
    {
      key: 'actions', header: 'Actions', width: '140px',
      render: b => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/admin/businesses/${b.id}`} style={{
            fontSize: 12, fontWeight: 500, color: 'var(--accent)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            View <MdArrowForward size={12}/>
          </Link>
          <button
            onClick={() => setSuspendTarget(b)}
            style={{
              fontSize: 12, fontWeight: 500, border: 'none', background: 'transparent', cursor: 'pointer',
              color: b.suspended_at ? '#15803D' : '#991B1B', padding: 0,
            }}
          >
            {b.suspended_at ? 'Unsuspend' : 'Suspend'}
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / 25);

  return (
    <>
      <AdminTopbar breadcrumbs={['Admin', 'Businesses']} pageTitle="Businesses"/>

      <main className="admin-main-pad" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Summary bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: 13 }}>
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{total.toLocaleString()}</span>
            <span style={{ color: 'var(--muted)', marginLeft: 4 }}>total businesses</span>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 340 }}>
            <MdSearch size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}/>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email…"
              style={{
                width: '100%', padding: '8px 10px 8px 32px',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdFilterList size={15} style={{ color: 'var(--muted)' }}/>
            <select
              value={planFilter}
              onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
              style={{
                padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer',
              }}
            >
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={b => b.id}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            loading={loading}
            emptyMessage="No businesses match your filters."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13,
            }}>
              <span style={{ color: 'var(--muted)' }}>
                Page {page} of {totalPages} · {total} results
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
                  Prev
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <ConfirmActionModal
        open={!!suspendTarget}
        title={suspendTarget?.suspended_at ? `Unsuspend ${suspendTarget?.name}?` : `Suspend ${suspendTarget?.name}?`}
        description={
          suspendTarget?.suspended_at
            ? 'This will restore the business access to the platform.'
            : 'This will immediately block the business from the platform. Provide a reason below.'
        }
        confirmLabel={suspendTarget?.suspended_at ? 'Unsuspend' : 'Suspend'}
        dangerous={!suspendTarget?.suspended_at}
        loading={suspending}
        onConfirm={confirmSuspend}
        onCancel={() => { setSuspendTarget(null); setSuspendReason(''); }}
      />
    </>
  );
}
