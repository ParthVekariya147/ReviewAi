'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard, MdBusiness, MdCreditCard, MdBarChart,
  MdShield, MdArticle, MdSettings, MdLogout, MdChevronLeft, MdChevronRight,
  MdReceipt, MdLocalOffer,
} from 'react-icons/md';

const NAV = [
  { id: 'dashboard',     href: '/admin/dashboard',                    label: 'Dashboard',     Icon: MdDashboard,  sub: false },
  { id: 'businesses',    href: '/admin/businesses',                   label: 'Businesses',    Icon: MdBusiness,   sub: false },
  { id: 'subscriptions', href: '/admin/subscriptions',               label: 'Subscriptions', Icon: MdCreditCard, sub: false },
  { id: 'invoices',      href: '/admin/subscriptions/invoices',       label: 'Invoices',      Icon: MdReceipt,    sub: true  },
  { id: 'plans',         href: '/admin/subscriptions/plans',          label: 'Plan Config',   Icon: MdLocalOffer, sub: true  },
  { id: 'analytics',    href: '/admin/analytics',                    label: 'Analytics',     Icon: MdBarChart,   sub: false },
  { id: 'abuse',        href: '/admin/analytics/abuse',              label: 'Abuse',         Icon: MdShield,     sub: true  },
  { id: 'audit',        href: '/admin/analytics/audit-logs',         label: 'Audit Logs',    Icon: MdArticle,    sub: true  },
];

const SETTINGS = { id: 'settings', href: '/admin/settings', label: 'Settings', Icon: MdSettings };

interface SidebarProps {
  adminEmail?: string;
  adminRole?: string;
}

export default function AdminSidebar({ adminEmail = '', adminRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const collapseRef = useRef<boolean>(collapsed);
  collapseRef.current = collapsed;

  // Persist collapse state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  function isActive(href: string) {
    if (href === '/admin/dashboard') return pathname === '/admin/dashboard' || pathname === '/admin';
    if (href === '/admin/analytics') return pathname === '/admin/analytics';
    if (href === '/admin/subscriptions') return pathname === '/admin/subscriptions';
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/auth/signout', { method: 'POST' });
    // Full reload so the server layout re-evaluates isAdmin with cleared cookies.
    // router.push() would serve the cached layout and leave the sidebar visible.
    window.location.href = '/admin/login';
  }

  const w = collapsed ? 64 : 240;

  return (
    <aside style={{
      width: w,
      minWidth: w,
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-tint)',
      borderRight: '1px solid var(--border)',
      transition: 'width 220ms ease',
      overflow: 'hidden',
      zIndex: 40,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '0 20px' : '0 18px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg,#6E5BFF 0%,#2F7DFB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>R</span>
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Reevo Admin</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap', marginTop: 1 }}>Internal only</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV.map(({ id, href, label, Icon, sub }) => {
          const active = isActive(href);
          return (
            <Link key={id} href={href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '9px 0' : sub ? '7px 10px 7px 22px' : '9px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              background: active ? 'var(--accent-soft)' : 'transparent',
              borderLeft: active ? '2px solid var(--accent)' : sub && !collapsed ? '2px solid var(--border)' : '2px solid transparent',
              color: active ? 'var(--accent-ink)' : sub ? 'var(--muted-2)' : 'var(--muted)',
              fontSize: sub ? 12 : 13,
              fontWeight: active ? 600 : 400,
              textDecoration: 'none',
              transition: 'background 120ms, color 120ms',
            }}>
              <Icon size={sub ? 15 : 18} style={{ flexShrink: 0 }}/>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </Link>
          );
        })}

        <div style={{ margin: '8px 0', height: 1, background: 'var(--border)' }}/>

        {/* Settings */}
        {(() => {
          const active = isActive(SETTINGS.href);
          const { Icon } = SETTINGS;
          return (
            <Link href={SETTINGS.href} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: collapsed ? '9px 0' : '9px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 'var(--radius-sm)',
              background: active ? 'var(--accent-soft)' : 'transparent',
              borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
              color: active ? 'var(--accent-ink)' : 'var(--muted)',
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              textDecoration: 'none',
            }}>
              <Icon size={18} style={{ flexShrink: 0 }}/>
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>Settings</span>}
            </Link>
          );
        })()}
      </nav>

      {/* User + collapse */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {!collapsed && (
          <div style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-2)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {adminEmail || 'Admin'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {adminRole.replace('_', ' ')}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '9px 0' : '9px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: 13,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <MdLogout size={17}/>
          {!collapsed && <span>{loggingOut ? 'Logging out…' : 'Logout'}</span>}
        </button>

        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--muted)',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {collapsed ? <MdChevronRight size={16}/> : <MdChevronLeft size={16}/>}
        </button>
      </div>
    </aside>
  );
}
