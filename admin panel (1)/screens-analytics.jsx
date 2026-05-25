// screens-analytics.jsx — Platform-wide analytics

const AnalyticsScreen = ({ shellProps }) => {
  const [dateRange, setDateRange] = React.useState('30d');
  const scansData = React.useMemo(() => genDailyScans(3), []);

  return (
    <Shell
      {...shellProps}
      active="analytics"
      breadcrumbs={['Admin', 'Analytics']}
      pageTitle="Platform Analytics"
      pageActions={
        <>
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden', background: 'var(--surface)' }}>
            {['7d', '30d', '90d'].map(r => (
              <button key={r} onClick={() => setDateRange(r)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600, height: 32,
                border: 'none', background: dateRange === r ? 'var(--accent-soft)' : 'transparent',
                color: dateRange === r ? 'var(--accent-ink)' : 'var(--muted)',
                cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
          <Select value="all" onChange={() => {}} prefix="Country:"
            options={[{ value: 'all', label: 'All countries' }, { value: 'us', label: 'United States' }, { value: 'uk', label: 'United Kingdom' }, { value: 'au', label: 'Australia' }]}/>
          <Select value="all" onChange={() => {}} prefix="Device:"
            options={[{ value: 'all', label: 'All devices' }, { value: 'mobile', label: 'Mobile' }, { value: 'tablet', label: 'Tablet' }, { value: 'desktop', label: 'Desktop' }]}/>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export</Button>
        </>
      }
    >
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard variant="gradient" label="Total Scans (30d)" value="421,832" delta="+18.6%" deltaDir="up" icon={<Ico.QR/>}/>
        <StatCard variant="flat" label="Reviews Generated" value="184,127" delta="+22.1%" deltaDir="up" icon={<Ico.Sparkles/>}/>
        <StatCard variant="flat" label="Avg Copy Rate" value="64.2%" delta="-2.1%" deltaDir="down" icon={<Ico.Star/>} sublabel="copy / generate"/>
        <StatCard variant="flat" label="Completion Rate" value="51.1%" delta="+4.4%" deltaDir="up" icon={<Ico.Check/>} sublabel="complete / scan"/>
        <StatCard variant="flat" label="Draft 1 Acceptance" value="71.2%" delta="+0.8%" deltaDir="up" icon={<Ico.Sparkles/>} sublabel="vs Draft 2"/>
      </div>

      {/* Daily scans chart */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '18px 20px 8px' }}>
          <SectionHeader title="Platform scans · last 30 days"
            subtitle="All businesses · all campaigns"
            actions={
              <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                  <span style={{ width: 10, height: 3, background: 'var(--accent-gradient)', borderRadius: 2 }}/>Scans
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
                  <span style={{ width: 10, height: 3, background: 'var(--accent-2)', borderRadius: 2, opacity: 0.5 }}/>Reviews
                </span>
              </div>
            }/>
        </div>
        <div style={{ padding: '0 12px 12px' }}>
          <DailyScansChart data={scansData} height={240}/>
        </div>
      </Card>

      {/* Funnel + device + draft */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={20}>
          <SectionHeader title="Event funnel" subtitle="scan → generate → copy → redirect → complete"/>
          <EventFunnel data={EVENT_FUNNEL}/>
        </Card>
        <Card padding={20}>
          <SectionHeader title="Device split"/>
          <DeviceDonutChart data={DEVICE_SPLIT}/>
          <div style={{ marginTop: 8 }}>
            {[
              { name: 'Mobile',  icon: <Ico.Smartphone size={14}/>, pct: '85.9%', count: '15,834' },
              { name: 'Tablet',  icon: <Ico.Tablet size={14}/>,     pct: '7.7%',  count:  '1,421' },
              { name: 'Desktop', icon: <Ico.Desktop size={14}/>,    pct: '6.4%',  count:  '1,177' },
            ].map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ display: 'inline-flex', color: 'var(--muted)' }}>{d.icon}</span>
                <span style={{ flex: 1 }}>{d.name}</span>
                <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{d.count}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 44, textAlign: 'right' }}>{d.pct}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card padding={20}>
          <SectionHeader title="Draft acceptance" subtitle="Draft 1 vs Draft 2 copied"/>
          <DraftAcceptance data={DRAFT_ACCEPTANCE}/>
        </Card>
      </div>

      {/* Top businesses + countries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card padding={20}>
          <SectionHeader title="Top businesses by scans"
            subtitle="Last 30 days · top 10"
            actions={<Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>}>See all</Button>}/>
          <HBarChart data={TOP_BUSINESSES_BY_SCANS} height={300}/>
        </Card>
        <Card padding={20}>
          <SectionHeader title="Top countries"
            subtitle="Scans by country · last 30 days"
            actions={<Button variant="ghost" size="sm" icon={<Ico.Globe size={12}/>}>Map view</Button>}/>
          <HBarChart data={TOP_COUNTRIES.slice(0, 10)} labelKey="country" height={300}/>
        </Card>
      </div>
    </Shell>
  );
};

Object.assign(window, { AnalyticsScreen });
