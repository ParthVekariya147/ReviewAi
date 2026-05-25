'use client';

import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

function Skeleton() {
  return (
    <tr>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{
            height: 14,
            borderRadius: 4,
            background: 'var(--surface-2)',
            animation: 'pulse 1.4s ease-in-out infinite',
            width: i === 0 ? '60%' : i === 1 ? '80%' : '50%',
          }}/>
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T>({
  columns, rows, getRowKey, sortKey, sortDir, onSort, loading = false, emptyMessage = 'No results',
}: DataTableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
            {columns.map(col => (
              <th key={col.key}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  width: col.width,
                  background: 'var(--surface)',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {col.header}
                  {col.sortable && sortKey === col.key && (
                    sortDir === 'asc' ? <MdArrowUpward size={12}/> : <MdArrowDownward size={12}/>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i}/>)
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: '48px 16px',
                textAlign: 'center',
                color: 'var(--muted)',
                fontSize: 13,
              }}>
                {emptyMessage}
              </td>
            </tr>
          ) : rows.map(row => (
            <tr key={getRowKey(row)} style={{
              borderBottom: '1px solid var(--border)',
              transition: 'background 100ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-soft)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  color: 'var(--ink)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: col.width ?? 'none',
                }}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
