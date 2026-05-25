// screens-dashboard.jsx — Main admin overview

const DashboardScreen = ({ shellProps, statCardStyle = 'gradient' }) => {
  const [dateRange, setDateRange] = React.useState('30d');
  const scansData = React.useMemo(() => genDailyScans(1), []);

  const stats = [
    { label: 'Total Businesses',     value: '1,247',   delta: '+12.4%', dir: 'up',   icon: <Ico.Businesses/>,    hero: true },
    { label: 'Active Subscriptions', value: '891',     delta: '+8.1%',  dir: 'up',   icon: <Ico.Subscriptions/> },
    { label: 'Paid Businesses',      value: '643',     delta: '+6.3%',  dir: 'up',   icon: <Ico.Revenue/> },
    { label: 'Scans Today',          value: '18,432',  delta: '+23.7%', dir: 'up',   icon: <Ico.QR/> },
    { label: 'Reviews Generated',    value: '9,218',   delta: '+18.2%', dir: 'up',   icon: <Ico.Sparkles/> },
    { label: 'Avg Copy Rate',        value: '64.2%',   delta: '-2.1%',  dir: 'down', icon: <Ico.Star/>,         sublabel: 'copy / generate' },
  ];

  return (
    <Shell
      {...shellProps}
      active="dashboard"
      breadcrumbs={['Admin', 'Dashboard']}
      pageTitle="Platform Overview"
      pageActions={
        <>
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden', background: 'var(--surface)' }}>
            {['7d', '30d', '90d'].map(r => (
              <button key={r} onClick={() => setDateRange(r)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                border: 'none', background: dateRange === r ? 'var(--accent-soft)' : 'transparent',
                color: dateRange === r ? 'var(--accent-ink)' : 'var(--muted)',
                cursor: 'pointer', height: 32,
              }}>{r}</button>
            ))}
          </div>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export</Button>
          <Button variant="primary" icon={<Ico.Plus size={14}/>}>New report</Button>
        </>
      }
    >
      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map((s, i) => (
          <StatCard key={i} label={s.label} value={s.value} delta={s.delta} deltaDir={s.dir} icon={s.icon}
            variant={s.hero ? (statCardStyle === 'flat' ? 'flat' : statCardStyle) : (statCardStyle === 'gradient' && !s.hero ? 'flat' : statCardStyle)}
            sublabel={s.sublabel}/>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Daily scans */}
        <Card padding={0}>
          <div style={{ padding: '18px 20px 8px' }}>
            <SectionHeader
              title="Daily scans · last 30 days"
              subtitle="Total QR scans across all businesses, with reviews generated overlay"
              actions={
                <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                    <span style={{ width: 10, height: 3, background: 'var(--accent-gradient)', borderRadius: 2 }}/>
                    Scans
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                    <span style={{ width: 10, height: 3, background: 'var(--accent-2)', borderRadius: 2, opacity: 0.6 }}/>
                    Reviews
                  </span>
                </div>
              }/>
          </div>
          <div style={{ padding: '0 12px 12px' }}>
            <DailyScansChart data={scansData} height={260}/>
          </div>
        </Card>

        {/* Plan distribution */}
        <Card padding={20}>
          <SectionHeader title="Plan distribution" subtitle="Businesses by current plan"/>
          <PlanDonutChart data={PLAN_DISTRIBUTION} height={180}/>
          <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <DonutLegend data={PLAN_DISTRIBUTION}/>
          </div>
        </Card>
      </div>

      {/* Bottom: funnel + activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card padding={20}>
          <SectionHeader title="Event funnel · today"
            subtitle="scan → generate → copy → redirect → complete"
            actions={<Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>}>Open analytics</Button>}/>
          <EventFunnel data={EVENT_FUNNEL}/>
        </Card>

        <Card padding={0}>
          <div style={{ padding: '18px 20px 14px' }}>
            <SectionHeader
              title="Recent activity"
              subtitle="Last 6 admin actions"
              actions={<Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>}>View all</Button>}/>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {DASHBOARD_AUDIT.map((a, i) => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                borderTop: i === 0 ? '1px solid var(--border)' : '1px solid var(--border)',
              }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 11, fontWeight: 700, flex: '0 0 auto', fontFamily: 'var(--font-mono)' }}>
                  {a.actor === 'system' ? 'S' : a.actor.split('@')[0].slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <ActionBadge action={a.action}/>
                    <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{a.target_name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    by <strong style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{a.actor}</strong> · {a.created_at}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
};

Object.assign(window, { DashboardScreen });
