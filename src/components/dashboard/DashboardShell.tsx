'use client';

import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface SidebarData {
  bizName:     string;
  bizInitials: string;
  bizColor:    string;
  bizPlan:     string;
  bizLogoUrl:  string | null;
  ownerName:   string;
  ownerEmail:  string;
}

interface DashboardShellProps {
  children:   React.ReactNode;
  sidebar:    SidebarData;
  ownerName:  string;
  banner?:    React.ReactNode;
}

export default function DashboardShell({ children, sidebar, ownerName, banner }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const close  = useCallback(() => setMobileOpen(false), []);
  const toggle = useCallback(() => setMobileOpen(o => !o), []);

  return (
    <div className="lp-root lp-app">
      {mobileOpen && (
        <div
          className="lp-sidebar-overlay"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <Sidebar {...sidebar} mobileOpen={mobileOpen} onClose={close} />
      <main className="lp-main">
        <Topbar ownerName={ownerName} ownerEmail={sidebar.ownerEmail} onMenuToggle={toggle} />
        {banner}
        {children}
      </main>
    </div>
  );
}
