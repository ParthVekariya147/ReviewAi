type StatusVariant =
  | 'active' | 'canceled' | 'past_due' | 'trialing'
  | 'draft'  | 'live'     | 'paused'
  | 'suspended'
  | 'paid'   | 'open'     | 'void'     | 'uncollectible'
  | 'bot'    | 'low-quality' | 'dead-funnel'
  | 'business.suspended' | 'plan.changed' | 'business.created';

const STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active:            { bg: '#DCFCE7', color: '#15803D', label: 'Active'        },
  canceled:          { bg: '#FEE2E2', color: '#991B1B', label: 'Canceled'      },
  past_due:          { bg: '#FEF9C3', color: '#92400E', label: 'Past due'      },
  trialing:          { bg: '#F0F9FF', color: '#0369A1', label: 'Trialing'      },
  draft:             { bg: 'var(--surface-2)', color: 'var(--muted)', label: 'Draft' },
  live:              { bg: '#DCFCE7', color: '#15803D', label: 'Live'          },
  paused:            { bg: '#FEF9C3', color: '#92400E', label: 'Paused'        },
  suspended:         { bg: '#FEE2E2', color: '#991B1B', label: 'Suspended'     },
  paid:              { bg: '#DCFCE7', color: '#15803D', label: 'Paid'          },
  open:              { bg: '#F0F9FF', color: '#0369A1', label: 'Open'          },
  void:              { bg: 'var(--surface-2)', color: 'var(--muted)', label: 'Void' },
  uncollectible:     { bg: '#FEE2E2', color: '#991B1B', label: 'Uncollectible' },
  bot:               { bg: '#FEE2E2', color: '#991B1B', label: 'Bot'           },
  'low-quality':     { bg: '#FEF9C3', color: '#92400E', label: 'Low quality'   },
  'dead-funnel':     { bg: 'var(--surface-2)', color: 'var(--muted)', label: 'Dead funnel' },
  'business.suspended': { bg: '#FEE2E2', color: '#991B1B', label: 'Suspended'  },
  'plan.changed':    { bg: 'var(--accent-soft)', color: 'var(--accent-ink)', label: 'Plan changed' },
  'business.created':{ bg: '#DCFCE7', color: '#15803D', label: 'Created'      },
};

export default function StatusBadge({ status }: { status: StatusVariant | string }) {
  const s = STYLES[status] ?? { bg: 'var(--surface-2)', color: 'var(--muted)', label: status };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 'var(--radius-xs)',
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}
