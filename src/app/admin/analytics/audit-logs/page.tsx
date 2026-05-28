'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminTopbar from '../../_components/shell/topbar';
import StatusBadge from '../../_components/badges/status-badge';
import type { AuditLog } from '@/types/admin';

const PAGE_SIZE = 25;

const ACTION_OPTIONS = [
  '',
  'business.suspended',
  'business.unsuspended',
  'business.plan_changed',
  'subscription.plan_changed',
  'qr.paused',
  'price.updated',
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');

  const queryKey = ['admin-audit-logs', page, actionFilter];
  const { data, isLoading: loading } = useQuery<{ data: AuditLog[]; total: number }>({
    queryKey,
    queryFn: () => {
      const sp = new URLSearchParams({ page: String(page) });
      if (actionFilter) sp.set('action', actionFilter);
      return fetch(`/api/admin/audit-logs?${sp}`).then(r => r.json());
    },
    staleTime: 30_000,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <AdminTopbar breadcrumbs={['Admin', 'Analytics', 'Audit Logs']} pageTitle="Audit Logs" />

      <main className="admin-main-pad" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <select
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            style={{ padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer' }}
          >
            <option value="">All actions</option>
            {ACTION_OPTIONS.filter(Boolean).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>
            {total.toLocaleString()} entries
          </span>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', height: 44, background: i % 2 ? 'var(--surface-2)' : 'var(--surface)', animation: 'pulse 1.4s infinite' }} />
            ))
          ) : logs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              No audit logs found.
            </div>
          ) : logs.map(log => (
            <div key={log.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
              <StatusBadge status={log.action} />
              <span style={{ color: 'var(--muted)' }}>by</span>
              <span style={{ fontWeight: 500, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{log.actor_email ?? 'System'}</span>
              {log.target_type && (
                <span style={{ color: 'var(--muted)', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {log.target_type} · {log.target_id?.slice(0, 8)}
                </span>
              )}
              <div style={{ flex: 1 }} />
              <span style={{ color: 'var(--muted-2)', fontSize: 11, whiteSpace: 'nowrap' }}>
                {fmtDate(log.created_at)}
              </span>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Page {page} of {totalPages} · {total} results</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >Prev</button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '5px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-2)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
