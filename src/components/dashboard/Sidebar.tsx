'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, Avatar, Btn } from './ui';

const BASE = '/app/business_dashboard';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard',     href: BASE,                         label: 'Dashboard',        icon: 'home'     as const },
      { id: 'funnel',        href: `${BASE}/funnel-manager`,     label: 'Funnel manager',   icon: 'funnel'   as const },
      { id: 'qr',            href: `${BASE}/qr-dashboard`,       label: 'QR codes',         icon: 'qr'       as const, badgeSoft: '5' },
      { id: 'analytics',     href: `${BASE}/analytics`,          label: 'Analytics',        icon: 'bars'     as const },
    ],
  },
  {
    label: 'Records',
    items: [
      { id: 'history',       href: `${BASE}/history`,            label: 'Review history',   icon: 'history'  as const, badgeSoft: '24' },
      { id: 'usage',         href: `${BASE}/usage`,              label: 'Usage',            icon: 'gauge'    as const },
      { id: 'notifications', href: `${BASE}/notifications`,      label: 'Notifications',    icon: 'bell'     as const, badge: '3' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'profile',       href: `${BASE}/profile`,            label: 'Business profile', icon: 'building' as const },
      { id: 'billing',       href: `${BASE}/billing`,            label: 'Billing',          icon: 'card'     as const },
      { id: 'settings',      href: `${BASE}/settings`,           label: 'Settings',         icon: 'cog'      as const },
    ],
  },
  {
    label: 'Setup',
    items: [
      { id: 'onboarding',    href: `${BASE}/onboarding`,         label: 'Onboarding tour',  icon: 'rocket'   as const },
      { id: 'qr-request',    href: `${BASE}/qr-request`,         label: 'Request QR',       icon: 'plus'     as const },
    ],
  },
];

interface SidebarProps {
  bizName?: string;
  bizInitials?: string;
  bizColor?: string;
  ownerName?: string;
}

export default function Sidebar({ bizName = 'Olive & Pine Bistro', bizInitials = 'O&P', bizColor = '#6366F1', ownerName = 'Maya Okafor' }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, id: string) => {
    if (id === 'dashboard') return pathname === BASE || pathname === BASE + '/';
    return pathname.startsWith(href);
  };

  const emailSlug = bizName.split(' ').slice(-2).join(' ').toLowerCase().replace(/[^a-z0-9]/g, '') + '@reevo';

  return (
    <aside className="lp-sidebar">
      <div className="lp-brand">
        <div className="lp-brand-mark">R</div>
        <div className="lp-brand-name"><b>Reevo</b></div>
      </div>

      <div className="lp-biz-select">
        <div className="lp-biz-logo" style={{ background: bizColor }}>{bizInitials}</div>
        <div className="lp-biz-info">
          <div className="lp-biz-name lp-truncate">{bizName}</div>
          <div className="lp-biz-sub">Pro plan</div>
        </div>
        <Icon name="chevronD" size={14} className="lp-muted"/>
      </div>

      <nav className="lp-sidebar-nav">
        {NAV_GROUPS.map(g => (
          <div key={g.label}>
            <div className="lp-nav-group">{g.label}</div>
            {g.items.map(item => (
              <Link key={item.id} href={item.href}
                    className={`lp-nav-item ${isActive(item.href, item.id) ? 'is-on' : ''}`}>
                <Icon name={item.icon} size={16}/>
                <span>{item.label}</span>
                {'badge' in item && item.badge && <span className="lp-nav-badge">{item.badge}</span>}
                {'badgeSoft' in item && item.badgeSoft && <span className="lp-nav-badge-soft">{item.badgeSoft}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="lp-sidebar-foot">
        <Avatar name={ownerName} size={32}/>
        <div className="lp-foot-info">
          <div className="lp-foot-name lp-truncate">{ownerName}</div>
          <div className="lp-foot-sub lp-truncate">{emailSlug}</div>
        </div>
        <Btn variant="ghost" icon="more" size="sm"/>
      </div>
    </aside>
  );
}
