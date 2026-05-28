'use client';

import { useState, useEffect } from 'react';
import { MdLightMode, MdDarkMode, MdSearch, MdMenu } from 'react-icons/md';
import Breadcrumbs from './breadcrumbs';
import { useAdminMobileMenu } from './AdminMobileCtx';

interface TopbarProps {
  breadcrumbs: string[];
  pageTitle: string;
  actions?: React.ReactNode;
}

export default function AdminTopbar({ breadcrumbs, pageTitle, actions }: TopbarProps) {
  const [dark, setDark] = useState(false);
  const { toggle } = useAdminMobileMenu();

  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      setDark(true);
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('admin-theme', next ? 'dark' : 'light');
  }

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '0 16px 0 20px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      flexShrink: 0,
    }}>
      {/* Hamburger — hidden on desktop, shown on mobile */}
      <button
        onClick={toggle}
        className="admin-topbar-menu-btn"
        aria-label="Open menu"
        style={{
          display: 'none', /* shown via CSS on mobile */
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)',
          color: 'var(--muted)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <MdMenu size={18}/>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Breadcrumbs items={breadcrumbs}/>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2 }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* ⌘K search hint — hidden on mobile */}
        <button className="admin-topbar-search" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          color: 'var(--muted)',
          fontSize: 12,
          cursor: 'pointer',
        }}>
          <MdSearch size={14}/>
          <span>Search</span>
          <span style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 4,
            background: 'var(--border)',
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
          }}>⌘K</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          {dark ? <MdLightMode size={16}/> : <MdDarkMode size={16}/>}
        </button>

        {/* Actions (page-specific) */}
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
