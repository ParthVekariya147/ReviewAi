'use client';

import { MdRefresh, MdBarChart } from 'react-icons/md';

interface ChartStateProps {
  type: 'loading' | 'empty' | 'error';
  height?: number;
  message?: string;
  onRetry?: () => void;
}

export default function ChartState({ type, height = 200, message, onRetry }: ChartStateProps) {
  if (type === 'loading') {
    return (
      <div style={{ height, borderRadius: 8, background: 'var(--bg-tint)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
    );
  }

  if (type === 'error') {
    return (
      <div style={{
        height, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8, color: 'var(--muted)', fontSize: 13,
      }}>
        <span style={{ color: '#991B1B', fontSize: 12 }}>{message ?? 'Failed to load chart data.'}</span>
        {onRetry && (
          <button onClick={onRetry} style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--ink-2)', cursor: 'pointer', fontSize: 12,
          }}>
            <MdRefresh size={13} /> Retry
          </button>
        )}
      </div>
    );
  }

  // empty
  return (
    <div style={{
      height, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 6, color: 'var(--muted)',
    }}>
      <MdBarChart size={28} style={{ opacity: 0.3 }} />
      <span style={{ fontSize: 12 }}>{message ?? 'No data yet'}</span>
    </div>
  );
}
