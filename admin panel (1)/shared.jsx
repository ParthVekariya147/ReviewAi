// shared.jsx — Shell (sidebar + topbar), badges, icons, table primitives.
// All components attached to window for cross-file use.

const { useState, useEffect, useMemo, useRef, useCallback, Fragment } = React;

// ============================================================
// Icons (single-source react-icons-style line SVGs at 18-20px)
// ============================================================
const Icon = ({ d, size = 18, sw = 1.6, fill = 'none', children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Ico = {
  Dashboard:    () => <Icon><rect x="3" y="3"  width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3"  y="16" width="7" height="5" rx="2"/></Icon>,
  Businesses:   () => <Icon><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/></Icon>,
  Subscriptions:() => <Icon><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20M6 15h4"/></Icon>,
  Analytics:    () => <Icon><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></Icon>,
  Abuse:        () => <Icon><path d="M12 3l9 4v6c0 5-3.5 7.5-9 8-5.5-.5-9-3-9-8V7l9-4z"/><path d="M12 8v4M12 16h.01"/></Icon>,
  Audit:        () => <Icon><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></Icon>,
  QR:           () => <Icon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M20 14v3M14 20h3M20 17v4"/></Icon>,
  Revenue:      () => <Icon><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>,
  AI:           () => <Icon><path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></Icon>,
  Settings:     () => <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.3l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  Search:       () => <Icon><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  Bell:         () => <Icon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>,
  Sun:          () => <Icon><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>,
  Moon:         () => <Icon><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></Icon>,
  ChevronDown:  () => <Icon><path d="M6 9l6 6 6-6"/></Icon>,
  ChevronRight: () => <Icon><path d="M9 6l6 6-6 6"/></Icon>,
  ChevronLeft:  () => <Icon><path d="M15 6l-6 6 6 6"/></Icon>,
  ArrowUp:      () => <Icon><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  ArrowDown:    () => <Icon><path d="M12 5v14M19 12l-7 7-7-7"/></Icon>,
  ArrowRight:   () => <Icon><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  Plus:         () => <Icon><path d="M12 5v14M5 12h14"/></Icon>,
  X:            () => <Icon><path d="M18 6L6 18M6 6l12 12"/></Icon>,
  Check:        () => <Icon><path d="M20 6L9 17l-5-5"/></Icon>,
  Eye:          () => <Icon><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Pause:        () => <Icon><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></Icon>,
  Archive:      () => <Icon><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M10 12h4"/></Icon>,
  Trash:        () => <Icon><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></Icon>,
  Filter:       () => <Icon><path d="M3 5h18M6 12h12M10 19h4"/></Icon>,
  Download:     () => <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Icon>,
  External:     () => <Icon><path d="M15 3h6v6M10 14L21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></Icon>,
  More:         () => <Icon><circle cx="12" cy="5"  r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></Icon>,
  Sidebar:      () => <Icon><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></Icon>,
  Logout:       () => <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></Icon>,
  Mail:         () => <Icon><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></Icon>,
  Lock:         () => <Icon><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>,
  Star:         () => <Icon><path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.8L12 17.8 5.7 21l1.2-6.8-5-4.9 7-1z"/></Icon>,
  ShieldAlert:  () => <Icon><path d="M12 3l9 4v6c0 5-3.5 7.5-9 8-5.5-.5-9-3-9-8V7l9-4z"/><path d="M12 8v4M12 16h.01"/></Icon>,
  Cmd:          () => <Icon><path d="M9 6V4a2 2 0 1 0-2 2h2zm0 0v12m0-12h6m0 0V4a2 2 0 1 1 2 2h-2zm0 0v12m0 0v2a2 2 0 1 0 2-2h-2zm-6 0v2a2 2 0 1 1-2-2h2zm0 0h6"/></Icon>,
  Smartphone:   () => <Icon><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/></Icon>,
  Tablet:       () => <Icon><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/></Icon>,
  Desktop:      () => <Icon><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></Icon>,
  Globe:        () => <Icon><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>,
  Clock:        () => <Icon><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Building:     () => <Icon><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></Icon>,
  Sparkles:     () => <Icon><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/></Icon>,
};

// ============================================================
// Reevo logo
// ============================================================
const ReevoMark = ({ size = 28 }) => (
  <span style={{
    width: size, height: size, borderRadius: 8,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--accent-gradient)',
    color: '#fff', fontWeight: 800, fontSize: size * 0.45,
    letterSpacing: '-0.02em',
    boxShadow: '0 4px 10px -4px rgba(110,91,255,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
  }}>R</span>
);

// ============================================================
// Plan & Status badges
// ============================================================
const PlanBadge = ({ plan, size = 'sm' }) => {
  const styles = {
    free:       { bg: 'var(--plan-free-bg)',    fg: 'var(--plan-free-ink)' },
    starter:    { bg: 'var(--plan-starter-bg)', fg: 'var(--plan-starter-ink)' },
    pro:        { bg: 'var(--plan-pro-bg)',     fg: 'var(--plan-pro-ink)' },
    enterprise: { bg: 'var(--accent-gradient)', fg: '#fff' },
  };
  const s = styles[plan] || styles.free;
  const isEnt = plan === 'enterprise';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      fontSize: size === 'sm' ? 11 : 12, fontWeight: 600,
      borderRadius: 'var(--radius-xs)',
      background: s.bg, color: s.fg,
      textTransform: 'capitalize',
      letterSpacing: '0.01em',
      boxShadow: isEnt ? '0 1px 0 rgba(255,255,255,0.2) inset' : 'none',
    }}>{plan}</span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    active:    { dot: 'var(--success)', bg: 'var(--success-soft)', fg: 'var(--success-ink)', label: 'Active' },
    canceled:  { dot: 'var(--muted)',   bg: 'var(--surface-2)',    fg: 'var(--ink-2)',       label: 'Canceled' },
    past_due:  { dot: 'var(--warning)', bg: 'var(--warning-soft)', fg: 'var(--warning-ink)', label: 'Past due' },
    trialing:  { dot: 'var(--info)',    bg: 'var(--info-soft)',    fg: 'var(--info-ink)',    label: 'Trialing' },
    suspended: { dot: 'var(--danger)',  bg: 'var(--danger-soft)',  fg: 'var(--danger-ink)',  label: 'Suspended' },
    live:      { dot: 'var(--success)', bg: 'var(--success-soft)', fg: 'var(--success-ink)', label: 'Live' },
    paused:    { dot: 'var(--warning)', bg: 'var(--warning-soft)', fg: 'var(--warning-ink)', label: 'Paused' },
    draft:     { dot: 'var(--muted)',   bg: 'var(--surface-2)',    fg: 'var(--ink-2)',       label: 'Draft' },
    paid:      { dot: 'var(--success)', bg: 'var(--success-soft)', fg: 'var(--success-ink)', label: 'Paid' },
    open:      { dot: 'var(--warning)', bg: 'var(--warning-soft)', fg: 'var(--warning-ink)', label: 'Open' },
    void:      { dot: 'var(--muted)',   bg: 'var(--surface-2)',    fg: 'var(--ink-2)',       label: 'Void' },
  };
  const s = map[status] || map.active;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 8px 3px 7px', fontSize: 11, fontWeight: 600,
      borderRadius: 'var(--radius-xs)',
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, boxShadow: `0 0 0 2px ${s.bg}` }} />
      {s.label}
    </span>
  );
};

const ActionBadge = ({ action }) => {
  // Color-codes audit log action types
  const map = {
    'business.suspended': { bg: 'var(--danger-soft)',  fg: 'var(--danger-ink)' },
    'business.created':   { bg: 'var(--success-soft)', fg: 'var(--success-ink)' },
    'plan.changed':       { bg: 'var(--plan-pro-bg)',  fg: 'var(--plan-pro-ink)' },
    'invoice.paid':       { bg: 'var(--success-soft)', fg: 'var(--success-ink)' },
    'payment.failed':     { bg: 'var(--danger-soft)',  fg: 'var(--danger-ink)' },
    'qr.paused':          { bg: 'var(--warning-soft)', fg: 'var(--warning-ink)' },
    'qr.archived':        { bg: 'var(--surface-2)',    fg: 'var(--ink-2)' },
    'admin.note.added':   { bg: 'var(--info-soft)',    fg: 'var(--info-ink)' },
  };
  const s = map[action] || { bg: 'var(--surface-2)', fg: 'var(--ink-2)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', fontSize: 11, fontWeight: 600,
      borderRadius: 'var(--radius-xs)',
      background: s.bg, color: s.fg,
      fontFamily: 'var(--font-mono)', letterSpacing: 0,
    }}>{action}</span>
  );
};

// Severity pill for abuse
const SeverityBadge = ({ severity }) => {
  const map = {
    critical: { bg: 'var(--danger)',     fg: '#fff' },
    high:     { bg: 'var(--danger-soft)',fg: 'var(--danger-ink)' },
    medium:   { bg: 'var(--warning-soft)',fg: 'var(--warning-ink)' },
    low:      { bg: 'var(--surface-2)',  fg: 'var(--ink-2)' },
  };
  const s = map[severity] || map.low;
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px',
      fontSize: 11, fontWeight: 700,
      borderRadius: 'var(--radius-xs)',
      background: s.bg, color: s.fg,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{severity}</span>
  );
};

const FlagTypeBadge = ({ flag }) => {
  const map = {
    bot_scan:    { label: 'Bot Scan',    bg: 'var(--danger-soft)',  fg: 'var(--danger-ink)' },
    dead_funnel: { label: 'Dead Funnel', bg: 'var(--surface-2)',    fg: 'var(--ink-2)' },
    low_quality: { label: 'Low Quality', bg: 'var(--warning-soft)', fg: 'var(--warning-ink)' },
  };
  const s = map[flag] || map.low_quality;
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px',
      fontSize: 11, fontWeight: 600,
      borderRadius: 'var(--radius-xs)',
      background: s.bg, color: s.fg,
      fontFamily: 'var(--font-mono)',
    }}>{s.label}</span>
  );
};

// ============================================================
// Avatar with initials and brand color
// ============================================================
const Avatar = ({ initials, color, size = 36, square = false }) => (
  <span style={{
    width: size, height: size,
    borderRadius: square ? Math.round(size * 0.22) : '50%',
    background: color || 'var(--accent-gradient)',
    color: '#fff', fontWeight: 700, fontSize: size * 0.4,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    letterSpacing: '0.02em',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    flex: '0 0 auto',
  }}>{initials}</span>
);

// ============================================================
// Buttons
// ============================================================
const Button = ({ children, variant = 'secondary', size = 'md', icon, iconRight, onClick, disabled, style, type = 'button', ...rest }) => {
  const sizes = {
    sm: { px: 10, py: 6, fs: 12, h: 28, gap: 6 },
    md: { px: 12, py: 8, fs: 13, h: 34, gap: 8 },
    lg: { px: 16, py: 10, fs: 14, h: 40, gap: 10 },
  };
  const s = sizes[size];
  const variants = {
    primary: {
      background: 'var(--accent-gradient)', color: '#fff',
      border: 'none',
      boxShadow: '0 4px 10px -4px rgba(110,91,255,0.5), inset 0 1px 0 rgba(255,255,255,0.18)',
    },
    secondary: {
      background: 'var(--surface)', color: 'var(--ink)',
      border: '1px solid var(--border-strong)',
      boxShadow: 'var(--shadow-xs)',
    },
    ghost: {
      background: 'transparent', color: 'var(--ink-2)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'var(--danger)', color: '#fff',
      border: 'none',
      boxShadow: '0 4px 10px -4px rgba(220,38,38,0.5)',
    },
    'danger-soft': {
      background: 'var(--danger-soft)', color: 'var(--danger-ink)',
      border: '1px solid transparent',
    },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, padding: `${s.py}px ${s.px}px`,
        fontSize: s.fs, fontWeight: 600,
        height: s.h, borderRadius: 'var(--radius-sm)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap',
        transition: 'transform .08s, box-shadow .15s, background .15s',
        ...variants[variant],
        ...style,
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'translateY(0.5px)'}
      onMouseUp={e => e.currentTarget.style.transform = ''}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
      {...rest}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
};

// ============================================================
// SidebarItem
// ============================================================
const SidebarItem = ({ label, icon, active, collapsed, badge, onClick }) => {
  return (
    <button onClick={onClick} title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center',
        gap: 12, width: '100%',
        padding: collapsed ? '10px 12px' : '10px 12px',
        margin: '1px 0',
        borderRadius: 'var(--radius-sm)',
        background: active ? 'var(--accent-gradient)' : 'transparent',
        color: active ? '#fff' : 'var(--ink-2)',
        border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: active ? 600 : 500,
        letterSpacing: '-0.005em',
        textAlign: 'left',
        position: 'relative',
        boxShadow: active ? '0 6px 14px -6px rgba(110,91,255,0.55), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
        transition: 'background .15s, color .15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ display: 'inline-flex', flex: '0 0 auto', color: active ? '#fff' : 'var(--ink-2)' }}>{icon}</span>
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{label}</span>
          {badge && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              padding: '2px 6px', borderRadius: 999,
              background: active ? 'rgba(255,255,255,0.22)' : 'var(--danger)',
              color: '#fff', minWidth: 18, textAlign: 'center',
            }}>{badge}</span>
          )}
        </>
      )}
    </button>
  );
};

// ============================================================
// Shell — full app frame with sidebar + topbar
// ============================================================
const Shell = ({
  children,
  active = 'dashboard',
  breadcrumbs = ['Admin'],
  pageTitle,
  pageActions,
  onNavigate,
  collapsed,
  setCollapsed,
  theme,
  setTheme,
  searchPlaceholder = 'Search businesses, subscriptions, audit log…',
}) => {
  const sidebarW = collapsed ? 64 : 240;

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',     icon: <Ico.Dashboard/> },
    { id: 'businesses',    label: 'Businesses',    icon: <Ico.Businesses/>, badge: '1.2k' },
    { id: 'qr',            label: 'QR Codes',      icon: <Ico.QR/> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Ico.Subscriptions/> },
    { id: 'revenue',       label: 'Revenue',       icon: <Ico.Revenue/> },
    { id: 'ai',            label: 'AI Usage',      icon: <Ico.AI/> },
    { id: 'analytics',     label: 'Analytics',     icon: <Ico.Analytics/> },
    { id: 'abuse',         label: 'Abuse Monitor', icon: <Ico.Abuse/>, badge: 6 },
    { id: 'audit',         label: 'Audit Logs',    icon: <Ico.Audit/> },
    { id: 'settings',      label: 'Settings',      icon: <Ico.Settings/> },
  ];

  return (
    <div style={{
      display: 'flex', width: '100%', height: '100%',
      background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarW, flex: `0 0 ${sidebarW}px`,
        background: 'var(--bg-tint)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width .2s ease',
        padding: '14px 12px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 14px' }}>
          <ReevoMark size={30} />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>Reevo</span>
              <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Console</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 8px', margin: '0 0 12px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--muted)', fontSize: 12,
            cursor: 'pointer',
          }}>
            <Ico.Search/>
            <span style={{ flex: 1 }}>Quick search</span>
            <span style={{
              padding: '1px 5px', borderRadius: 4,
              background: 'var(--surface-2)', fontFamily: 'var(--font-mono)',
              fontSize: 10, color: 'var(--ink-2)',
            }}>⌘K</span>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto' }}>
          {!collapsed && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 12px 6px' }}>Platform</div>}
          {navItems.map(n => (
            <SidebarItem key={n.id} label={n.label} icon={n.icon}
              active={active === n.id} collapsed={collapsed} badge={n.badge}
              onClick={() => onNavigate && onNavigate(n.id)} />
          ))}
        </nav>

        {/* Footer admin user */}
        <div style={{
          marginTop: 8, padding: collapsed ? '8px 4px' : '10px 8px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar initials="PR" color="var(--accent-gradient)" size={collapsed ? 28 : 32}/>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Priya Reddy</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>priya@reevo.io</div>
              </div>
              <button title="Sign out" style={{
                width: 28, height: 28, border: '1px solid var(--border)',
                background: 'var(--surface)', borderRadius: 'var(--radius-xs)',
                cursor: 'pointer', color: 'var(--muted)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}><Ico.Logout/></button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 56, flex: '0 0 56px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center',
          padding: '0 24px', gap: 16,
        }}>
          <button onClick={() => setCollapsed && setCollapsed(c => !c)}
            style={{ width: 30, height: 30, border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="Collapse sidebar">
            <Ico.Sidebar/>
          </button>

          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', minWidth: 0 }}>
            {breadcrumbs.map((b, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'var(--muted-2)', display: 'inline-flex' }}><Ico.ChevronRight size={14}/></span>}
                <span style={{
                  color: i === breadcrumbs.length - 1 ? 'var(--ink)' : 'var(--muted)',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 500,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  maxWidth: 280,
                }}>{b}</span>
              </span>
            ))}
          </div>

          <div style={{ flex: 1 }}/>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', width: 340,
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--muted)', fontSize: 13,
          }}>
            <Ico.Search/>
            <input placeholder={searchPlaceholder}
              style={{ border: 0, outline: 0, background: 'transparent', flex: 1, fontSize: 13, color: 'var(--ink)' }}/>
            <span style={{
              padding: '1px 5px', borderRadius: 4, background: 'var(--surface-2)',
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-2)',
            }}>⌘K</span>
          </div>

          {/* Theme toggle */}
          <button onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
            style={{ width: 34, height: 34, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? <Ico.Sun/> : <Ico.Moon/>}
          </button>

          {/* Notifications */}
          <button style={{ position: 'relative', width: 34, height: 34, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ico.Bell/>
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 0 2px var(--surface)' }}/>
          </button>

          {/* Avatar dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 4px 4px 10px', border: '1px solid var(--border-strong)', borderRadius: 999, background: 'var(--surface)', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Priya</span>
            <Avatar initials="PR" color="var(--accent-gradient)" size={26}/>
          </div>
        </header>

        {/* Page header */}
        {(pageTitle || pageActions) && (
          <div style={{
            padding: '20px 32px 16px',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: 16, flexWrap: 'wrap',
          }}>
            <div>
              {pageTitle && (
                <h1 style={{
                  margin: 0, fontSize: 24, fontWeight: 700,
                  letterSpacing: '-0.02em', color: 'var(--ink)',
                }}>{pageTitle}</h1>
              )}
            </div>
            {pageActions && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {pageActions}
              </div>
            )}
          </div>
        )}

        {/* Page content */}
        <main style={{
          flex: 1, overflow: 'auto',
          padding: '0 32px 32px',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// ============================================================
// Card primitive
// ============================================================
const Card = ({ children, style, padding = 20, ...rest }) => (
  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-xs)',
    padding,
    ...style,
  }} {...rest}>
    {children}
  </div>
);

// ============================================================
// StatCard — 3 variants: flat, gradient, outlined
// ============================================================
const StatCard = ({ label, value, delta, deltaDir = 'up', icon, variant = 'flat', sublabel }) => {
  const isGradient = variant === 'gradient';
  const positive = deltaDir === 'up';
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      padding: 20,
      borderRadius: 'var(--radius-md)',
      background: isGradient ? 'var(--accent-gradient)' : 'var(--surface)',
      border: variant === 'outlined' ? '1px solid var(--border-strong)' : (isGradient ? 'none' : '1px solid var(--border)'),
      boxShadow: isGradient ? '0 14px 30px -16px rgba(110,91,255,0.55)' : 'var(--shadow-xs)',
      color: isGradient ? '#fff' : 'var(--ink)',
    }}>
      {isGradient && (
        <>
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 140, height: 140,
            borderRadius: '50%', background: 'rgba(255,255,255,0.10)',
          }}/>
          <div style={{
            position: 'absolute', bottom: -50, left: -10, width: 100, height: 100,
            borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
          }}/>
        </>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: isGradient ? 'rgba(255,255,255,0.18)' : 'var(--accent-soft)',
          color: isGradient ? '#fff' : 'var(--accent-ink)',
        }}>{icon}</span>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: isGradient ? 'rgba(255,255,255,0.85)' : 'var(--muted)',
          letterSpacing: '-0.005em',
        }}>{label}</span>
      </div>
      <div style={{
        position: 'relative',
        fontSize: 30, fontWeight: 700,
        letterSpacing: '-0.03em',
        lineHeight: 1.05,
      }}>{value}</div>
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 8,
        marginTop: 10, fontSize: 12,
      }}>
        {delta != null && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            padding: '2px 6px', borderRadius: 'var(--radius-xs)',
            background: isGradient
              ? 'rgba(255,255,255,0.18)'
              : (positive ? 'var(--success-soft)' : 'var(--danger-soft)'),
            color: isGradient ? '#fff' : (positive ? 'var(--success-ink)' : 'var(--danger-ink)'),
            fontWeight: 600,
          }}>
            <span style={{ display: 'inline-flex' }}>
              {positive ? <Ico.ArrowUp size={12} sw={2.4}/> : <Ico.ArrowDown size={12} sw={2.4}/>}
            </span>
            {delta}
          </span>
        )}
        <span style={{ color: isGradient ? 'rgba(255,255,255,0.75)' : 'var(--muted)' }}>{sublabel || 'vs last 7d'}</span>
      </div>
    </div>
  );
};

// ============================================================
// SectionHeader
// ============================================================
const SectionHeader = ({ title, subtitle, actions, style }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 14, ...style }}>
    <div>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: '-0.005em', color: 'var(--ink)' }}>{title}</h3>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
    {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
  </div>
);

// ============================================================
// Tabs
// ============================================================
const Tabs = ({ tabs, value, onChange, rightSlot }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 4,
    borderBottom: '1px solid var(--border)',
    marginBottom: 20,
  }}>
    {tabs.map(t => {
      const active = t.id === value;
      return (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            background: 'transparent', border: 'none',
            padding: '10px 14px',
            fontSize: 13, fontWeight: active ? 600 : 500,
            color: active ? 'var(--ink)' : 'var(--muted)',
            cursor: 'pointer',
            position: 'relative', top: 1,
            borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {t.label}
          {t.count != null && (
            <span style={{
              fontSize: 11, padding: '1px 6px', borderRadius: 999,
              background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
              color: active ? 'var(--accent-ink)' : 'var(--muted)',
              fontWeight: 600,
            }}>{t.count}</span>
          )}
        </button>
      );
    })}
    <div style={{ flex: 1 }}/>
    {rightSlot}
  </div>
);

// ============================================================
// Input + Select
// ============================================================
const Input = ({ icon, ...rest }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '6px 10px', height: 34,
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)',
    color: 'var(--muted)',
    minWidth: 0,
  }}>
    {icon}
    <input {...rest}
      style={{ border: 0, outline: 0, background: 'transparent', flex: 1, fontSize: 13, color: 'var(--ink)', minWidth: 0 }}/>
  </div>
);

const Select = ({ value, onChange, options, prefix }) => (
  <label style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    height: 34, padding: '0 10px',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)',
    fontSize: 13, color: 'var(--ink-2)',
    cursor: 'pointer',
  }}>
    {prefix && <span style={{ color: 'var(--muted)' }}>{prefix}</span>}
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ border: 0, outline: 0, background: 'transparent', fontSize: 13, color: 'var(--ink)', appearance: 'none', paddingRight: 4, fontWeight: 500 }}>
      {options.map(o => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
    <Ico.ChevronDown size={14}/>
  </label>
);

// ============================================================
// DataTable scaffolding
// ============================================================
const Table = ({ children, style }) => (
  <div style={{
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-xs)',
    ...style,
  }}>
    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
      {children}
    </table>
  </div>
);

const Th = ({ children, sortable, sortDir, onSort, align = 'left', width }) => (
  <th style={{
    textAlign: align, padding: '11px 16px',
    background: 'var(--bg-soft)',
    borderBottom: '1px solid var(--border)',
    fontSize: 11, fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    width,
    position: 'sticky', top: 0, zIndex: 1,
    cursor: sortable ? 'pointer' : 'default',
    userSelect: 'none',
  }} onClick={sortable ? onSort : undefined}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {children}
      {sortable && (
        <span style={{ display: 'inline-flex', flexDirection: 'column', opacity: sortDir ? 1 : 0.4, color: 'var(--muted)' }}>
          <svg width="8" height="5" viewBox="0 0 8 5" style={{ marginBottom: 1 }}><path d="M4 0L0 4h8z" fill={sortDir === 'asc' ? 'var(--ink)' : 'currentColor'}/></svg>
          <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 5L0 1h8z" fill={sortDir === 'desc' ? 'var(--ink)' : 'currentColor'}/></svg>
        </span>
      )}
    </span>
  </th>
);

const Td = ({ children, align = 'left', mono, muted, style, colSpan }) => (
  <td colSpan={colSpan} style={{
    padding: 'var(--row-pad-y, 14px) 16px',
    textAlign: align,
    color: muted ? 'var(--muted)' : 'var(--ink)',
    fontFamily: mono ? 'var(--font-mono)' : 'inherit',
    fontSize: mono ? 12 : 13,
    fontWeight: mono ? 500 : 400,
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle',
    ...style,
  }}>{children}</td>
);

const Tr = ({ children, hoverable = true, onClick, selected }) => (
  <tr onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : 'default',
      background: selected ? 'var(--accent-soft)' : 'transparent',
      transition: 'background .12s',
    }}
    onMouseEnter={e => { if (hoverable && !selected) e.currentTarget.style.background = 'var(--bg-soft)'; }}
    onMouseLeave={e => { if (hoverable && !selected) e.currentTarget.style.background = 'transparent'; }}
  >{children}</tr>
);

// ============================================================
// Checkbox
// ============================================================
const Checkbox = ({ checked, onChange, indeterminate }) => (
  <span
    role="checkbox" aria-checked={!!checked}
    onClick={e => { e.stopPropagation(); onChange && onChange(!checked); }}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 16, height: 16, borderRadius: 4,
      border: '1.5px solid ' + ((checked || indeterminate) ? 'var(--accent)' : 'var(--border-strong)'),
      background: (checked || indeterminate) ? 'var(--accent)' : 'var(--surface)',
      cursor: 'pointer',
      transition: 'border-color .15s, background .15s',
      flex: '0 0 auto',
    }}
  >
    {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
    {!checked && indeterminate && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><path d="M5 12h14"/></svg>}
  </span>
);

// ============================================================
// Pagination
// ============================================================
const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderTop: '1px solid var(--border)',
      fontSize: 13, color: 'var(--muted)',
    }}>
      <div>Showing <strong style={{ color: 'var(--ink)' }}>{start.toLocaleString()}–{end.toLocaleString()}</strong> of <strong style={{ color: 'var(--ink)' }}>{total.toLocaleString()}</strong></div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Button size="sm" variant="secondary" icon={<Ico.ChevronLeft size={14}/>} disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}>Previous</Button>
        {[1, 2, 3, '…', pages].map((p, i) => p === '…' ? (
          <span key={i} style={{ padding: '0 4px', color: 'var(--muted)' }}>…</span>
        ) : (
          <button key={i} onClick={() => onPageChange(p)} style={{
            minWidth: 28, height: 28, padding: '0 8px',
            border: '1px solid ' + (p === page ? 'var(--accent)' : 'var(--border)'),
            background: p === page ? 'var(--accent-soft)' : 'var(--surface)',
            color: p === page ? 'var(--accent-ink)' : 'var(--ink-2)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{p}</button>
        ))}
        <Button size="sm" variant="secondary" iconRight={<Ico.ChevronRight size={14}/>}
          onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
};

// ============================================================
// Empty state
// ============================================================
const EmptyState = ({ title, subtitle, icon }) => (
  <div style={{
    padding: 60, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center',
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: 'var(--surface-2)', color: 'var(--muted)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    }}>{icon || <Ico.Search/>}</div>
    <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{subtitle}</div>
  </div>
);

// ============================================================
// Mini sparkline (CSS-only, no recharts dep for stats)
// ============================================================
const Sparkline = ({ data, color = 'var(--accent)', height = 30, width = 100 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

Object.assign(window, {
  Icon, Ico, ReevoMark,
  PlanBadge, StatusBadge, ActionBadge, SeverityBadge, FlagTypeBadge,
  Avatar, Button, SidebarItem, Shell,
  Card, StatCard, SectionHeader, Tabs,
  Input, Select,
  Table, Th, Td, Tr, Checkbox, Pagination, EmptyState, Sparkline,
});
