'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, Avatar } from './ui';

const BASE = '/app/business_dashboard';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard',     href: BASE,                         label: 'Dashboard',        icon: 'home'     as const },
      { id: 'funnel',        href: `${BASE}/funnel-manager`,     label: 'Funnel manager',   icon: 'funnel'   as const },
      { id: 'qr',            href: `${BASE}/qr-dashboard`,       label: 'QR codes',         icon: 'qr'       as const },
      { id: 'analytics',     href: `${BASE}/analytics`,          label: 'Analytics',        icon: 'bars'     as const },
    ],
  },
  {
    label: 'Records',
    items: [
      { id: 'history',       href: `${BASE}/history`,            label: 'Review history',   icon: 'history'  as const },
      { id: 'usage',         href: `${BASE}/usage`,              label: 'Usage',            icon: 'gauge'    as const },
      { id: 'notifications', href: `${BASE}/notifications`,      label: 'Notifications',    icon: 'bell'     as const },
    ],
  },
  {
    label: 'Setup',
    items: [
      { id: 'qr-request',    href: `${BASE}/qr-request`,         label: 'Request QR',       icon: 'plus'     as const },
    ],
  },
];

interface SidebarProps {
  bizName?:     string;
  bizInitials?: string;
  bizColor?:    string;
  bizPlan?:     string;
  ownerName?:   string;
  ownerEmail?:  string;
}

export default function Sidebar({
  bizName     = '',
  bizInitials = '',
  bizColor    = '#6366F1',
  bizPlan     = 'free',
  ownerName   = '',
  ownerEmail  = '',
}: SidebarProps) {
  const pathname  = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  /* Close menu on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (href: string, id: string) => {
    if (id === 'dashboard') return pathname === BASE || pathname === BASE + '/';
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/';
  }

  const planLabel = bizPlan === 'pro' ? 'Pro plan' : bizPlan === 'enterprise' ? 'Enterprise' : 'Free plan';

  return (
    <aside className="lp-sidebar">
      <div className="lp-brand">
        <div className="lp-brand-mark">R</div>
        <div className="lp-brand-name"><b>Reevo</b></div>
      </div>

      <div className="lp-biz-select">
        <div className="lp-biz-logo" style={{ background: bizColor }}>
          {bizInitials || bizName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || '??'}
        </div>
        <div className="lp-biz-info">
          <div className="lp-biz-name lp-truncate">{bizName || 'Your business'}</div>
          <div className="lp-biz-sub">{planLabel}</div>
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
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer with user info + logout menu */}
      <div className="lp-sidebar-foot" ref={menuRef} style={{ position: 'relative' }}>
        <Avatar name={ownerName || ownerEmail} size={32}/>
        <div className="lp-foot-info">
          <div className="lp-foot-name lp-truncate">{ownerName || ownerEmail.split('@')[0]}</div>
          <div className="lp-foot-sub lp-truncate">{ownerEmail}</div>
        </div>
        <button
          className="lp-btn lp-btn-ghost lp-btn-sm"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="User menu"
          style={{ flexShrink: 0 }}
        >
          <Icon name="more" size={16}/>
        </button>

        {menuOpen && (
          <div style={{
            position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
            background: 'var(--lp-surface)', border: '1px solid var(--lp-border)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 180, zIndex: 100, overflow: 'hidden',
          }}>
            <Link
              href={`${BASE}/profile`}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: 'var(--lp-fg)', textDecoration: 'none', cursor: 'pointer' }}
              className="lp-menu-row"
            >
              <Icon name="building" size={14}/> Business profile
            </Link>
            <Link
              href={`${BASE}/settings`}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', fontSize: 13, color: 'var(--lp-fg)', textDecoration: 'none', cursor: 'pointer' }}
              className="lp-menu-row"
            >
              <Icon name="cog" size={14}/> Settings
            </Link>
            <div style={{ height: 1, background: 'var(--lp-border)', margin: '4px 0' }}/>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', fontSize: 13, background: 'none', border: 'none', color: 'var(--lp-danger, #ef4444)', cursor: 'pointer', textAlign: 'left' }}
              className="lp-menu-row"
            >
              <Icon name="arrow" size={14}/>
              {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
