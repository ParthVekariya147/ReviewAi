import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number;          // e.g. 12.4 = +12.4%, -2.1 = -2.1%
  sublabel?: string;
  icon?: React.ReactNode;
  hero?: boolean;          // gradient variant for the first card
}

export default function StatCard({ label, value, delta, sublabel, icon, hero }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const deltaTxt = delta !== undefined
    ? `${positive ? '+' : ''}${delta.toFixed(1)}%`
    : null;

  return (
    <div style={{
      background: hero
        ? 'linear-gradient(135deg,#6E5BFF 0%,#2F7DFB 100%)'
        : 'var(--surface)',
      border: hero ? 'none' : '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 20px',
      boxShadow: hero ? 'var(--shadow-md)' : 'var(--shadow-xs)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: hero ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>
          {label}
        </span>
        {icon && (
          <span style={{ color: hero ? 'rgba(255,255,255,0.8)' : 'var(--muted)', fontSize: 18 }}>
            {icon}
          </span>
        )}
      </div>

      <div style={{ fontSize: 26, fontWeight: 700, color: hero ? '#fff' : 'var(--ink)', lineHeight: 1 }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {deltaTxt && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 11,
            fontWeight: 600,
            color: hero
              ? 'rgba(255,255,255,0.85)'
              : (positive ? '#15803D' : '#991B1B'),
          }}>
            {positive
              ? <MdTrendingUp size={12}/>
              : <MdTrendingDown size={12}/>}
            {deltaTxt}
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: 11, color: hero ? 'rgba(255,255,255,0.6)' : 'var(--muted-2)' }}>
            {sublabel}
          </span>
        )}
        {deltaTxt && !sublabel && (
          <span style={{ fontSize: 11, color: hero ? 'rgba(255,255,255,0.6)' : 'var(--muted-2)' }}>
            vs last 7d
          </span>
        )}
      </div>
    </div>
  );
}
