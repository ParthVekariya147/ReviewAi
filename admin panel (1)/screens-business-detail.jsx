// screens-business-detail.jsx — 5-tab business detail
// Uses Sunrise Bakery & Café (biz_0001) as the focus business.

const BusinessDetailScreen = ({ shellProps }) => {
  const biz = BUSINESSES.find(b => b.id === 'biz_0001');
  const [tab, setTab] = React.useState('overview');
  const [showPlanModal, setShowPlanModal] = React.useState(false);
  const [showSuspendModal, setShowSuspendModal] = React.useState(false);
  const scansData = React.useMemo(() => genDailyScans(2), []);
  const businessAuditLog = FULL_AUDIT.filter(a => a.target_id === biz.id || a.target_name === biz.name).slice(0, 5).concat(
    [
      { id: 'al_8801', actor: 'priya@reevo.io', action: 'plan.changed', target_type: 'subscription', target_id: 'sub_0001', target_name: biz.name, meta: { from: 'starter', to: 'pro' }, created_at: 'Feb 14 · 2:18 PM' },
      { id: 'al_8800', actor: 'admin@reevo.io', action: 'admin.note.added', target_type: 'business', target_id: biz.id, target_name: biz.name, meta: { note: 'Multi-location rollout next month' }, created_at: 'Feb 11 · 11:02 AM' },
      { id: 'al_8799', actor: 'system', action: 'invoice.paid', target_type: 'invoice', target_id: 'inv_8501', target_name: biz.name, meta: { amount_cents: 4900 }, created_at: 'Feb 1 · 6:22 AM' },
      { id: 'al_8798', actor: 'system', action: 'business.created', target_type: 'business', target_id: biz.id, target_name: biz.name, meta: { plan: 'free' }, created_at: 'Aug 14 · 8:04 AM' },
    ]
  );

  return (
    <Shell
      {...shellProps}
      active="businesses"
      breadcrumbs={['Admin', 'Businesses', biz.name]}
    >
      {/* Header banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '20px 24px', marginTop: 12, marginBottom: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xs)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'var(--accent-gradient-soft)',
          opacity: 0.6, pointerEvents: 'none',
        }}/>
        <Avatar initials={biz.logo_initials} color={biz.brand_color} size={64} square/>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{biz.name}</h2>
            <StatusBadge status={biz.status}/>
            <PlanBadge plan={biz.plan}/>
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ico.Mail size={12}/>{biz.owner_email}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ico.Globe size={12}/>{biz.country}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ico.Building size={12}/>{biz.business_type}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)' }}><span style={{ color: 'var(--muted-2)' }}>id</span> {biz.id}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Ico.Clock size={12}/>Joined {fmtDate(biz.created_at)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <Button variant="secondary" icon={<Ico.External size={14}/>}>View as owner</Button>
          <Button variant="secondary" icon={<Ico.Sparkles size={14}/>} onClick={() => setShowPlanModal(true)}>Change plan</Button>
          <Button variant="danger-soft" icon={<Ico.Pause size={14}/>} onClick={() => setShowSuspendModal(true)}>Suspend</Button>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'overview',      label: 'Overview' },
          { id: 'campaigns',     label: 'QR Campaigns', count: biz.qr_campaigns },
          { id: 'analytics',     label: 'Analytics' },
          { id: 'subscription',  label: 'Subscription' },
          { id: 'audit',         label: 'Audit Log',    count: 18 },
        ]}/>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
            <StatCard variant="gradient" label="Total Scans" value="8,420" delta="+18.2%" deltaDir="up" icon={<Ico.QR/>}/>
            <StatCard variant="flat" label="Reviews Generated" value="6,184" delta="+22.4%" deltaDir="up" icon={<Ico.Sparkles/>}/>
            <StatCard variant="flat" label="Copy Rate" value="71.4%" delta="+3.1%" deltaDir="up" icon={<Ico.Star/>}/>
            <StatCard variant="flat" label="Active Campaigns" value="4 / 10" delta="" deltaDir="up" icon={<Ico.QR/>} sublabel="of pro plan limit"/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
            <Card padding={0}>
              <div style={{ padding: '18px 20px 8px' }}>
                <SectionHeader title="Scans · last 30 days" subtitle="All campaigns for this business"/>
              </div>
              <div style={{ padding: '0 12px 12px' }}>
                <DailyScansChart data={scansData} height={220} showReviews={false}/>
              </div>
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Top campaigns this month</div>
                {QR_CAMPAIGNS.slice(0, 3).map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{
                      width: 32, height: 32, borderRadius: 6, background: 'var(--surface-2)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', flex: '0 0 auto',
                    }}><Ico.QR size={16}/></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.campaign_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>/r/{c.token}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtNum(c.scans)}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{Math.round(c.copy_rate * 100)}% copy</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding={20}>
              <SectionHeader title="Business info" subtitle="Schema fields"/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                {[
                  ['business_type',    biz.business_type],
                  ['language',         biz.language],
                  ['min_rating_for_google', `${biz.min_rating_for_google}★ minimum`],
                  ['brand_color',      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: biz.brand_color, border: '1px solid var(--border-strong)' }}/><code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{biz.brand_color}</code></span>],
                  ['logo_initials',    biz.logo_initials],
                  ['review_keywords',  biz.review_keywords],
                  ['google_link',      <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>g.page/r/sb-0 <Ico.External size={11}/></a>],
                  ['onboarding_complete', biz.onboarding_complete ? <span style={{ color: 'var(--success-ink)', fontWeight: 600 }}>true</span> : <span style={{ color: 'var(--warning-ink)', fontWeight: 600 }}>false</span>],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                    <code style={{ flex: '0 0 150px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{k}</code>
                    <div style={{ flex: 1, color: 'var(--ink)' }}>{v}</div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>} style={{ marginTop: 8 }}>Add admin note</Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: QR Campaigns */}
      {tab === 'campaigns' && (
        <Table>
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Token</Th>
              <Th>Status</Th>
              <Th align="right">Scans</Th>
              <Th align="right">Copy rate</Th>
              <Th>Created</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {QR_CAMPAIGNS.map(c => (
              <Tr key={c.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}><Ico.QR size={16}/></span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.campaign_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                        {c.dynamic && <span>Dynamic</span>}
                        {c.ab_testing && <span style={{ color: 'var(--accent-ink)' }}>· A/B</span>}
                        {c.pause_fallback && <span style={{ color: 'var(--warning-ink)' }}>· Pause fallback</span>}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td mono>/r/{c.token}</Td>
                <Td><StatusBadge status={c.status}/></Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{fmtNum(c.scans)}</Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{c.scans > 0 ? `${Math.round(c.copy_rate * 100)}%` : '—'}</Td>
                <Td muted>{fmtDate(c.created_at)}</Td>
                <Td align="right">
                  <div style={{ display: 'inline-flex', gap: 4 }}>
                    <Button size="sm" variant="ghost" icon={<Ico.Eye size={12}/>}>View</Button>
                    <Button size="sm" variant="ghost" icon={<Ico.Pause size={12}/>}>Pause</Button>
                    <Button size="sm" variant="ghost" icon={<Ico.Archive size={12}/>}>Archive</Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Tab: Analytics */}
      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
          <Card padding={20}>
            <SectionHeader title="Event funnel · last 30 days"
              subtitle="scan → generate → refresh → copy → redirect → complete"/>
            <EventFunnel data={[
              { event: 'scan',     count: 8420, pct: 1.000 },
              { event: 'generate', count: 7411, pct: 0.880 },
              { event: 'refresh',  count: 1689, pct: 0.201 },
              { event: 'copy',     count: 6014, pct: 0.714 },
              { event: 'redirect', count: 5582, pct: 0.663 },
              { event: 'complete', count: 4801, pct: 0.570 },
            ]}/>
          </Card>
          <Card padding={20}>
            <SectionHeader title="Device split"/>
            <DeviceDonutChart data={[
              { name: 'Mobile',  value: 7290 },
              { name: 'Tablet',  value:  712 },
              { name: 'Desktop', value:  418 },
            ]}/>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
              {[
                { name: 'Mobile',  icon: <Ico.Smartphone size={14}/>, pct: '86.6%' },
                { name: 'Tablet',  icon: <Ico.Tablet size={14}/>,     pct: '8.5%' },
                { name: 'Desktop', icon: <Ico.Desktop size={14}/>,    pct: '4.9%' },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 12 }}>{d.icon}{d.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{d.pct}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding={20}>
            <SectionHeader title="Top countries" subtitle="By scan volume · last 30 days"/>
            <HBarChart data={[
              { name: 'Italy',          scans: 3120 },
              { name: 'United Kingdom', scans: 1840 },
              { name: 'United States',  scans: 1612 },
              { name: 'France',         scans:  642 },
              { name: 'Spain',          scans:  481 },
              { name: 'Germany',        scans:  325 },
            ]} height={240}/>
          </Card>

          <Card padding={20}>
            <SectionHeader title="Draft acceptance" subtitle="Which AI-generated draft did users copy?"/>
            <DraftAcceptance data={DRAFT_ACCEPTANCE}/>
            <div style={{ marginTop: 16, padding: '10px 12px', background: 'var(--info-soft)', color: 'var(--info-ink)', fontSize: 12, borderRadius: 'var(--radius-sm)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <Ico.Sparkles size={14}/>
              <span><strong>71% accept Draft 1</strong> — good prompt fit. A high refresh rate ({'>'} 40%) on Draft 1 is a quality signal worth investigating.</span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Subscription */}
      {tab === 'subscription' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16 }}>
          <Card padding={20}>
            <SectionHeader title="Subscription"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Plan</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PlanBadge plan="pro" size="md"/>
                  <span style={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>$49<span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>/mo</span></span>
                </div>
              </div>
              {[
                ['Status',             <StatusBadge status="active"/>],
                ['Provider',           <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>stripe</code>],
                ['Provider ID',        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>sub_1Q8jKLBPGq2H</code>],
                ['Current period end', fmtDate('2025-04-14')],
                ['Cancel at period end', <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}><span style={{ width: 28, height: 16, borderRadius: 8, background: 'var(--surface-2)', display: 'inline-flex', alignItems: 'center', padding: 2 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--muted)', boxShadow: 'var(--shadow-xs)' }}/></span>off</span>],
                ['MRR contribution',   <strong style={{ color: 'var(--ink)' }}>$49.00</strong>],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <span style={{ color: 'var(--ink-2)' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="secondary" size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowPlanModal(true)}>Change plan</Button>
                <Button variant="danger-soft" size="sm" style={{ flex: 1, justifyContent: 'center' }}>Cancel</Button>
              </div>
            </div>
          </Card>

          <Card padding={0}>
            <div style={{ padding: '18px 20px' }}>
              <SectionHeader title="Invoice history"
                actions={<Button variant="ghost" size="sm" icon={<Ico.Download size={12}/>}>Export</Button>}/>
            </div>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  <Th>Invoice</Th>
                  <Th align="right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                  <Th align="right">PDF</Th>
                </tr>
              </thead>
              <tbody>
                {INVOICES_MOSAIC.map(inv => (
                  <Tr key={inv.id}>
                    <Td mono>{inv.id}</Td>
                    <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtMoney(inv.amount_cents, inv.currency)}</Td>
                    <Td><StatusBadge status={inv.status}/></Td>
                    <Td muted>{fmtDate(inv.created_at)}</Td>
                    <Td align="right">
                      <a href={inv.pdf_url} style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        Download <Ico.Download size={12}/>
                      </a>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Tab: Audit log */}
      {tab === 'audit' && (
        <Table>
          <thead>
            <tr>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Meta</Th>
              <Th>When</Th>
            </tr>
          </thead>
          <tbody>
            {businessAuditLog.map(a => (
              <Tr key={a.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar initials={a.actor === 'system' ? 'S' : a.actor.slice(0, 2).toUpperCase()} color={a.actor === 'system' ? 'var(--muted)' : 'var(--accent-gradient)'} size={26}/>
                    <span style={{ fontSize: 13 }}>{a.actor}</span>
                  </div>
                </Td>
                <Td><ActionBadge action={a.action}/></Td>
                <Td mono>{a.target_type}<span style={{ color: 'var(--muted)' }}>/</span>{a.target_id}</Td>
                <Td muted style={{ fontSize: 12, maxWidth: 360 }}>
                  <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-2)' }}>
                    {JSON.stringify(a.meta).slice(0, 80)}
                  </code>
                </Td>
                <Td muted>{a.created_at}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <ChangePlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} businessName={biz.name} currentPlan={biz.plan}/>
      <SuspendBusinessModal open={showSuspendModal} onClose={() => setShowSuspendModal(false)} businessName={biz.name}/>
    </Shell>
  );
};

Object.assign(window, { BusinessDetailScreen });
