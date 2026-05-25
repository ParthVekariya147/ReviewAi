// screens-abuse.jsx — Abuse monitoring with eye-catching outliers

const AbuseScreen = ({ shellProps }) => {
  const [tab, setTab] = React.useState('flags');
  const [severityFilter, setSeverityFilter] = React.useState('all');
  const [flagFilter, setFlagFilter] = React.useState('all');

  const filtered = ABUSE_FLAGS.filter(f =>
    (severityFilter === 'all' || f.severity === severityFilter) &&
    (flagFilter === 'all' || f.flag_type === flagFilter)
  );

  return (
    <Shell
      {...shellProps}
      active="abuse"
      breadcrumbs={['Admin', 'Abuse Monitoring']}
      pageTitle="Abuse Monitoring"
      pageActions={
        <>
          <Button variant="secondary" icon={<Ico.Filter size={14}/>}>Configure rules</Button>
          <Button variant="primary" icon={<Ico.Download size={14}/>}>Export flags</Button>
        </>
      }
    >
      {/* Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', marginBottom: 16,
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(90deg, var(--danger-soft) 0%, var(--warning-soft) 100%)',
        border: '1px solid var(--danger)',
        color: 'var(--danger-ink)',
      }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--danger)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <Ico.ShieldAlert/>
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>3 critical flags require attention</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Bot scan patterns and dead funnels detected in the last hour. Review and pause if confirmed.</div>
        </div>
        <Button variant="danger" size="sm">Review now</Button>
      </div>

      {/* Detection rules summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Flags last 24h',   value: '17', delta: '+8',  icon: <Ico.Abuse/>,       tone: 'danger' },
          { label: 'Critical · open',  value: '3',                 icon: <Ico.ShieldAlert/>,  tone: 'danger' },
          { label: 'QR codes paused',  value: '12', delta: '+3',   icon: <Ico.Pause/>,        tone: 'warning' },
          { label: 'Auto-detection rules', value: '7', icon: <Ico.Filter/>,                  tone: 'info' },
        ].map((s, i) => (
          <Card key={i} padding={16}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: `var(--${s.tone}-soft)`, color: `var(--${s.tone}-ink)`,
              }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {s.value} {s.delta && <span style={{ fontSize: 11, color: 'var(--danger-ink)', fontWeight: 600, marginLeft: 4 }}>{s.delta}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onChange={setTab}
        tabs={[
          { id: 'flags',    label: 'Active flags',    count: ABUSE_FLAGS.length },
          { id: 'history',  label: 'Resolved history', count: 47 },
          { id: 'rules',    label: 'Detection rules',  count: 7 },
        ]}/>

      {/* Filters */}
      {tab === 'flags' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Select value={severityFilter} onChange={setSeverityFilter} prefix="Severity:"
              options={[{ value: 'all', label: 'All' }, { value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]}/>
            <Select value={flagFilter} onChange={setFlagFilter} prefix="Type:"
              options={[{ value: 'all', label: 'All flags' }, { value: 'bot_scan', label: 'Bot scan' }, { value: 'dead_funnel', label: 'Dead funnel' }, { value: 'low_quality', label: 'Low quality' }]}/>
            <div style={{ flex: 1 }}/>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Showing <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> active flags</div>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Severity</Th>
                <Th>Business · QR campaign</Th>
                <Th>Flag</Th>
                <Th align="right">Scans</Th>
                <Th align="right">Copy rate</Th>
                <Th align="right">Refresh rate</Th>
                <Th>Detected</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <Tr key={f.id}>
                  <Td><SeverityBadge severity={f.severity}/></Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: f.severity === 'critical' ? 'var(--danger-soft)' : 'var(--surface-2)',
                        color: f.severity === 'critical' ? 'var(--danger)' : 'var(--muted)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}><Ico.QR size={16}/></span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600 }}>{f.business_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span>{f.campaign_name}</span>
                          <span style={{ color: 'var(--muted-2)' }}>·</span>
                          <code style={{ fontFamily: 'var(--font-mono)' }}>/r/{f.qr_token}</code>
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <FlagTypeBadge flag={f.flag_type}/>
                      <div style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 240 }}>{f.note}</div>
                    </div>
                  </Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: f.scan_count > 5000 ? 700 : 500, color: f.scan_count > 5000 ? 'var(--danger-ink)' : 'var(--ink)' }}>{fmtNum(f.scan_count)}</Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: f.copy_rate < 0.05 ? 'var(--danger-ink)' : 'var(--ink-2)' }}>
                    {(f.copy_rate * 100).toFixed(1)}%
                  </Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: f.refresh_rate > 0.5 ? 'var(--danger-ink)' : 'var(--ink-2)' }}>
                    {(f.refresh_rate * 100).toFixed(0)}%
                  </Td>
                  <Td muted>{f.detected_at}</Td>
                  <Td align="right">
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <Button size="sm" variant="ghost" icon={<Ico.Pause size={12}/>}>Pause QR</Button>
                      <Button size="sm" variant="danger-soft" icon={<Ico.ShieldAlert size={12}/>}>Suspend</Button>
                      <Button size="sm" variant="ghost" icon={<Ico.X size={12}/>}>Dismiss</Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {tab === 'rules' && (
        <Card padding={0}>
          {[
            { id: 'bot_scan_rate', name: 'Bot scan rate', desc: 'Flag QR codes with > 500 scans/hour from < 5 unique IPs', tone: 'critical', enabled: true },
            { id: 'dead_funnel',   name: 'Dead funnel',   desc: 'QR codes with > 100 scans but 0 copy events in 30 days', tone: 'high',      enabled: true },
            { id: 'refresh_abuse', name: 'Refresh abuse', desc: 'Businesses with > 80% refresh rate over 7 days',         tone: 'medium',    enabled: true },
            { id: 'low_copy',      name: 'Low copy rate', desc: 'Campaigns with < 5% copy rate after > 500 scans',        tone: 'medium',    enabled: true },
            { id: 'ip_burst',      name: 'IP burst',      desc: 'Same IP scanning > 10× in under 1 minute',                tone: 'critical', enabled: false, note: 'Requires qr_scans.ip_address field' },
            { id: 'geo_anomaly',   name: 'Geo anomaly',   desc: 'Sudden country shift unrelated to campaign launch',       tone: 'low',       enabled: true },
            { id: 'spam_keywords', name: 'AI spam keywords', desc: 'Generated reviews containing flagged keywords',          tone: 'high',     enabled: true },
          ].map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < 6 ? '1px solid var(--border)' : 'none' }}>
              <span style={{
                width: 6, height: 32, borderRadius: 3,
                background: r.tone === 'critical' ? 'var(--danger)' : r.tone === 'high' ? 'var(--warning)' : r.tone === 'medium' ? 'var(--info)' : 'var(--muted)',
                flex: '0 0 auto',
              }}/>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</span>
                  <code style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>rule.{r.id}</code>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {r.desc}
                  {r.note && <span style={{ marginLeft: 8, color: 'var(--warning-ink)' }}>· {r.note}</span>}
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: 2,
                width: 36, height: 20, borderRadius: 10,
                background: r.enabled ? 'var(--accent)' : 'var(--surface-2)',
                justifyContent: r.enabled ? 'flex-end' : 'flex-start',
                cursor: 'pointer',
              }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
              </span>
            </div>
          ))}
        </Card>
      )}

      {tab === 'history' && (
        <EmptyState
          icon={<Ico.Check/>}
          title="No resolved flags in this view"
          subtitle="Resolved flags from the last 30 days appear here. Switch to 'Active flags' to see open items."/>
      )}
    </Shell>
  );
};

Object.assign(window, { AbuseScreen });
