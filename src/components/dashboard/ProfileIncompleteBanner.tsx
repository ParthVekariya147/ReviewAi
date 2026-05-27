'use client';

import { useState, useEffect } from 'react';
import { Icon } from './ui';

interface Props {
  missingFields: string[];
}

const STORAGE_KEY = 'reevo_profile_banner_dismissed';

const FIELD_LABELS: Record<string, string> = {
  tagline:       'business tagline',
  business_type: 'business type',
  owner_name:    'owner name',
};

export default function ProfileIncompleteBanner({ missingFields }: Props) {
  const [dismissed, setDismissed] = useState(true); // hidden until hydrated

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || missingFields.length === 0) return null;

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setDismissed(true);
  }

  const labels = missingFields
    .map(f => FIELD_LABELS[f] ?? f)
    .join(', ');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '10px 20px',
      background: 'rgba(245,158,11,0.08)',
      borderBottom: '1px solid rgba(245,158,11,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
        <Icon name="sparkles" size={15} style={{ color: '#D97706', flexShrink: 0 }} />
        <span style={{ color: 'var(--lp-fg)' }}>
          Your profile is missing: <strong>{labels}</strong>.
        </span>
        <a
          href="/app/business_dashboard/settings"
          style={{ color: '#D97706', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
        >
          Complete your profile →
        </a>
      </div>
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--lp-fg-muted)', display: 'flex', flexShrink: 0,
          padding: 4,
        }}
        aria-label="Dismiss"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
