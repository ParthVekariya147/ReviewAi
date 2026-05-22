'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { Icon, Input, Avatar } from './ui';

const BASE = '/app/business_dashboard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TopbarProps {
  ownerName?: string;
}

export default function Topbar({ ownerName = '' }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { data } = useSWR<{ unreadCount: number }>(
    '/api/notifications?summary=1', fetcher, { refreshInterval: 60_000 },
  );
  const hasUnread = (data?.unreadCount ?? 0) > 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`${BASE}/history?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  return (
    <div className="lp-topbar">
      <div className="lp-topbar-search">
        <Input
          icon="search"
          placeholder="Search reviews… (press Enter)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="lp-topbar-actions">
        <Link href={`${BASE}/qr-request`} className="lp-topbar-btn" title="New QR campaign">
          <Icon name="plus" size={16}/>
        </Link>
        <Link href={`${BASE}/notifications`} className="lp-topbar-btn" title="Notifications">
          <Icon name="bell" size={16}/>
          {hasUnread && <span className="lp-topbar-dot"/>}
        </Link>
        <Link href={`${BASE}/settings`} className="lp-topbar-btn" title="Settings">
          <Icon name="cog" size={16}/>
        </Link>
        <div style={{ width: 1, height: 22, background: 'var(--lp-border)', margin: '0 4px' }}/>
        <Avatar name={ownerName} size={30}/>
      </div>
    </div>
  );
}
