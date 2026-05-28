'use client';

import { useEffect, useState, useCallback } from 'react';
import { MdSearch, MdOpenInNew, MdPictureAsPdf } from 'react-icons/md';
import AdminTopbar from '../../_components/shell/topbar';
import DataTable, { type Column } from '../../_components/tables/data-table';
import StatusBadge from '../../_components/badges/status-badge';
import type { AdminInvoice, InvoiceStatus } from '@/types/admin';

interface InvoiceRow extends AdminInvoice {
  business_name: string;
}

type Summary = { total_revenue: number; open_count: number; paid_count: number };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
function fmtMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}

const STATUS_OPTIONS: { value: InvoiceStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'paid', label: 'Paid' },
  { value: 'open', label: 'Open' },
  { value: 'void', label: 'Void' },
  { value: 'uncollectible', label: 'Uncollectible' },
];

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams({ page: String(page) });
    if (statusFilter) sp.set('status', statusFilter);
    if (search) sp.set('q', search);
    const res = await fetch(`/api/admin/invoices?${sp}`);
    if (res.ok) {
      const json = await res.json();
      setRows(json.data);
      setTotal(json.total);
      setSummary(json.summary);
    }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<InvoiceRow>[] = [
    {
      key: 'business_name', header: 'Business', width: '200px',
      render: row => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>{row.business_name || '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>{row.subscription_id.slice(0, 8)}…</div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', width: '120px',
      render: row => <StatusBadge status={row.status}/>,
    },
    {
      key: 'amount_cents', header: 'Amount', sortable: false, width: '110px',
      render: row => (
        <span style={{ fontWeight: 600, color: row.status === 'paid' ? 'var(--accent-ink)' : 'var(--ink)', fontSize: 13 }}>
          {fmtMoney(row.amount_cents, row.currency)}
        </span>
      ),
    },
    {
      key: 'currency', header: 'Currency', width: '80px',
      render: row => <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>{row.currency}</span>,
    },
    {
      key: 'provider_inv_id', header: 'Provider ID', width: '160px',
      render: row => (
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
          {row.provider_inv_id ?? '—'}
        </span>
      ),
    },
    {
      key: 'created_at', header: 'Date', sortable: false, width: '120px',
      render: row => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fmtDate(row.created_at)}</span>,
    },
    {
      key: 'pdf_url', header: 'PDF', width: '64px',
      render: row => row.pdf_url ? (
        <a href={row.pdf_url} target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, textDecoration: 'none' }}>
          <MdPictureAsPdf size={14}/> PDF <MdOpenInNew size={10}/>
        </a>
      ) : <span style={{ color: 'var(--muted-2)', fontSize: 12 }}>—</span>,
    },
  ];

  const totalPages = Math.ceil(total / 25);

  return (
    <>
      <AdminTopbar breadcrumbs={['Admin', 'Subscriptions', 'Invoices']} pageTitle="Invoices"/>

      <main className="admin-main-pad" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>

        {/* Summary bar */}
        {summary && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Revenue', value: fmtMoney(summary.total_revenue), accent: true },
              { label: 'Paid Invoices', value: summary.paid_count.toLocaleString(), accent: false },
              { label: 'Open Invoices', value: summary.open_count.toLocaleString(), accent: false, warn: summary.open_count > 0 },
            ].map(item => (
              <div key={item.label} style={{
                background: item.accent ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${item.accent ? 'transparent' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                minWidth: 140,
              }}>
                <span style={{ fontSize: 11, color: item.accent ? 'rgba(255,255,255,0.75)' : 'var(--muted)', fontWeight: 500 }}>{item.label}</span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: item.accent ? '#fff' : item.warn ? '#991B1B' : 'var(--ink)',
                }}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="admin-filter-bar" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: 220, maxWidth: 300, flex: 1 }}>
            <MdSearch size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}/>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search business name…"
              style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as InvoiceStatus | ''); setPage(1); }}
            style={{ padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer' }}
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>{total.toLocaleString()} invoices</span>
        </div>

        {/* Table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            rows={rows}
            getRowKey={r => r.id}
            sortKey=""
            sortDir="desc"
            onSort={() => {}}
            loading={loading}
            emptyMessage="No invoices match your filters."
          />
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
