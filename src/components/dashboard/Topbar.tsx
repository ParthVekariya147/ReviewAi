'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Icon, Input, Avatar } from './ui';

const BASE = '/app/business_dashboard';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface TopbarProps {
  ownerName?:    string;
  ownerEmail?:   string;
  onMenuToggle?: () => void;
}

export default function Topbar({ ownerName = '', ownerEmail = '', onMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery<{ unreadCount: number }>({
    queryKey: ['/api/notifications?summary=1'],
    queryFn:  () => fetcher('/api/notifications?summary=1'),
    refetchInterval: 60_000,
  });
  const hasUnread = (data?.unreadCount ?? 0) > 0;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`${BASE}/history?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/auth/signout', { method: 'POST' });
    window.location.href = '/login';
  }

  const displayName = ownerName || ownerEmail.split('@')[0];

  return (
    <div className="lp-topbar">
      {/* Hamburger — hidden on desktop, shown on mobile via CSS */}
      <button
        className="lp-topbar-menu-btn"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
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

        {/* User avatar + dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', borderRadius: '50%' }}
            aria-label="User menu"
          >
            <Avatar name={displayName} size={30}/>
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: 'var(--lp-surface)', border: '1px solid var(--lp-border)',
              borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: 220, zIndex: 200, overflow: 'hidden',
            }}>
              {/* User identity header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--lp-border)' }}>
                <Avatar name={displayName} size={36}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--lp-fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: 'var(--lp-fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ownerEmail}</div>
                </div>
              </div>

              {/* Links */}
              <Link
                href={`${BASE}/profile`}
                onClick={() => setUserMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: 'var(--lp-fg)', textDecoration: 'none' }}
                className="lp-menu-row"
              >
                <Icon name="building" size={14}/> Business profile
              </Link>
              <Link
                href={`${BASE}/settings`}
                onClick={() => setUserMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: 'var(--lp-fg)', textDecoration: 'none' }}
                className="lp-menu-row"
              >
                <Icon name="cog" size={14}/> Settings
              </Link>

              {/* Log out */}
              <div style={{ borderTop: '1px solid var(--lp-border)' }}>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 16px', fontSize: 13, color: 'var(--lp-danger, #ef4444)',
                    background: 'none', border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer',
                    textAlign: 'left', opacity: loggingOut ? 0.6 : 1,
                  }}
                  className="lp-menu-row lp-menu-danger"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {loggingOut ? 'Logging out…' : 'Log out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
