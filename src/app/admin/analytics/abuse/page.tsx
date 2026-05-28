'use client';

import { useEffect, useState } from 'react';
import AdminTopbar from '../../_components/shell/topbar';
import StatusBadge from '../../_components/badges/status-badge';
import type { AbuseEntry } from '@/types/admin';

export default function AbusePage() {
  const [rows, setRows] = useState<AbuseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/abuse')
      .then(r => r.json())
      .then(d => { setRows(d.data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleQRAction(qrId: string) {
    await fetch(`/api/admin/qr/${qrId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' }),
    });
    setRows(r => r.filter(row => row.qr_id !== qrId));
  }

  return (
    <>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <AdminTopbar breadcrumbs={['Admin', 'Analytics', 'Abuse']} pageTitle="Abuse Monitoring" />

      <main className="admin-main-pad" style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
          QR codes flagged for unusually high scan-to-copy ratios or suspicious volumes.
        </p>

        {loading ? (
          <div style={{ height: 200, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.4s infinite' }}/>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {rows.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                No abuse patterns detected.
              </div>
            ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                    {['Business', 'Campaign', 'Flag', 'Scans', 'Copy rate', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{row.business_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-2)' }}>{row.campaign_name}</td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={row.flag_type} /></td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink)' }}>{row.scan_count.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink)' }}>{row.copy_rate}%</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleQRAction(row.qr_id)}
                          style={{ fontSize: 12, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}
                        >
                          Pause QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
