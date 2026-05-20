'use client';

import Link from 'next/link';
import { Icon, Input, Avatar } from './ui';

const BASE = '/app/business_dashboard';

interface TopbarProps {
  ownerName?: string;
}

export default function Topbar({ ownerName = 'Maya Okafor' }: TopbarProps) {
  return (
    <div className="lp-topbar">
      <div className="lp-topbar-search">
        <Input icon="search" placeholder="Search campaigns, reviews, customers…"/>
      </div>
      <div className="lp-topbar-actions">
        <Link href={`${BASE}/qr-request`} className="lp-topbar-btn" title="New QR campaign">
          <Icon name="plus" size={16}/>
        </Link>
        <Link href={`${BASE}/notifications`} className="lp-topbar-btn" title="Notifications">
          <Icon name="bell" size={16}/>
          <span className="lp-topbar-dot"/>
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
