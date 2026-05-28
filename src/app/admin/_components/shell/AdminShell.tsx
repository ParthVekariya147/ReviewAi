'use client';

import { useState, useCallback } from 'react';
import AdminSidebar from './sidebar';
import { AdminMobileCtx } from './AdminMobileCtx';
import type { ReactNode } from 'react';

interface AdminShellProps {
  children:   ReactNode;
  adminEmail: string;
  adminRole:  string;
}

export default function AdminShell({ children, adminEmail, adminRole }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close  = useCallback(() => setMobileOpen(false), []);
  const toggle = useCallback(() => setMobileOpen(o => !o), []);

  return (
    <AdminMobileCtx.Provider value={{ toggle }}>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div
            onClick={close}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 199,
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
            }}
          />
        )}
        <AdminSidebar
          adminEmail={adminEmail}
          adminRole={adminRole}
          mobileOpen={mobileOpen}
          onClose={close}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {children}
        </div>
      </div>
    </AdminMobileCtx.Provider>
  );
}
