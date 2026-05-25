// screens-subscriptions.jsx — Subscriptions list + detail

const SubscriptionsListScreen = ({ shellProps }) => {
  const [search, setSearch] = React.useState('');
  const [planFilter, setPlanFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    let rows = SUBSCRIPTIONS.filter(s => s.plan !== 'free' || true);
    if (search.trim()) rows = rows.filter(s => s.business_name.toLowerCase().includes(search.toLowerCase()));
    if (planFilter !== 'all') rows = rows.filter(s => s.plan === planFilter);
    if (statusFilter !== 'all') rows = rows.filter(s => s.status === statusFilter);
    return rows;
  }, [search, planFilter, statusFilter]);

  return (
    <Shell
      {...shellProps}
      active="subscriptions"
      breadcrumbs={['Admin', 'Subscriptions']}
      pageTitle="Subscriptions"
      pageActions={
        <>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export CSV</Button>
          <Button variant="primary" icon={<Ico.Revenue size={14}/>}>Revenue report</Button>
        </>
      }>

      {/* MRR Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ flex: 1, padding: 20, position: 'relative' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 6 }}>Monthly Recurring Revenue</div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                $48,324
              </div>
              <div style={{ marginTop: 8, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 'var(--radius-xs)', background: 'var(--success-soft)', color: 'var(--success-ink)', fontWeight: 600 }}>
                  <Ico.ArrowUp size={12} sw={2.5}/> +10.6%
                </span>
                <span style={{ color: 'var(--muted)' }}>vs January</span>
              </div>
            </div>
            <div style={{ flex: '0 0 140px', padding: '10px 8px' }}>
              <MRRChart data={MRR_SERIES} height={110}/>
            </div>
          </div>
        </Card>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--success-soft)', color: 'var(--success-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.Check/></span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Paid subscriptions</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>643</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Across starter, pro & enterprise</div>
        </Card>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--warning-soft)', color: 'var(--warning-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.Clock/></span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Canceling at period end</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>28</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>$1,372 MRR at risk</div>
        </Card>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--danger-soft)', color: 'var(--danger-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.ShieldAlert/></span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Past due</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>14</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Will dunning in 3 days</div>
        </Card>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 300 }}>
          <Input icon={<Ico.Search/>} placeholder="Search business name…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Select value={planFilter} onChange={setPlanFilter} prefix="Plan:"
          options={[{ value: 'all', label: 'All plans' }, ...PLANS.map(p => ({ value: p, label: p }))]}/>
        <Select value={statusFilter} onChange={setStatusFilter} prefix="Status:"
          options={[{ value: 'all', label: 'All statuses' }, ...['active', 'past_due', 'canceled', 'trialing'].map(s => ({ value: s, label: s }))]}/>
        <Select value="period-desc" onChange={() => {}} prefix="Sort:"
          options={[{ value: 'period-desc', label: 'Period end · newest' }, { value: 'mrr-desc', label: 'Highest MRR' }, { value: 'created-asc', label: 'Oldest first' }]}/>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> of {SUBSCRIPTIONS.length} subscriptions
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Business</Th>
            <Th>Plan</Th>
            <Th>Status</Th>
            <Th>Provider</Th>
            <Th>Provider ID</Th>
            <Th align="right">MRR</Th>
            <Th>Period end</Th>
            <Th align="center">Cancel</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => {
            const biz = BUSINESSES.find(b => b.id === s.business_id);
            return (
              <Tr key={s.id}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar initials={biz.logo_initials} color={biz.brand_color} size={28} square/>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.business_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{s.id}</div>
                    </div>
                  </div>
                </Td>
                <Td><PlanBadge plan={s.plan}/></Td>
                <Td><StatusBadge status={s.status}/></Td>
                <Td>
                  {s.provider ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)' }}>{s.provider}</span>
                  ) : <span style={{ color: 'var(--muted-2)' }}>—</span>}
                </Td>
                <Td mono muted>
                  {s.provider_id ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {s.provider_id.slice(0, 14)}…
                    </span>
                  ) : '—'}
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {s.amount_cents > 0 ? fmtMoney(s.amount_cents) : <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>—</span>}
                </Td>
                <Td muted>{fmtDate(s.current_period_end)}</Td>
                <Td align="center">
                  {s.cancel_at_end ? (
                    <span style={{ display: 'inline-flex', padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 'var(--radius-xs)', background: 'var(--warning-soft)', color: 'var(--warning-ink)' }}>Yes</span>
                  ) : <span style={{ color: 'var(--muted-2)', fontSize: 12 }}>—</span>}
                </Td>
                <Td muted>{fmtDate(s.created_at)}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>

      <Pagination page={page} pageSize={25} total={891} onPageChange={setPage}/>
    </Shell>
  );
};

const SubscriptionDetailScreen = ({ shellProps }) => {
  // Mosaic Coffee Roasters — sub_0009
  const biz = BUSINESSES.find(b => b.id === 'biz_0009');
  const sub = SUBSCRIPTIONS.find(s => s.id === 'sub_0009');
  const [showPlanModal, setShowPlanModal] = React.useState(false);

  return (
    <Shell
      {...shellProps}
      active="subscriptions"
      breadcrumbs={['Admin', 'Subscriptions', sub.id]}
      pageTitle={`Subscription · ${biz.name}`}
      pageActions={
        <>
          <Button variant="secondary" icon={<Ico.External size={14}/>}>Open in Stripe</Button>
          <Button variant="secondary" icon={<Ico.Sparkles size={14}/>} onClick={() => setShowPlanModal(true)}>Change plan</Button>
          <Button variant="danger-soft" icon={<Ico.X size={14}/>}>Cancel subscription</Button>
        </>
      }>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding={20}>
            <SectionHeader title="Business"/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <Avatar initials={biz.logo_initials} color={biz.brand_color} size={48} square/>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{biz.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{biz.owner_email}</div>
              </div>
              <Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>}>Profile</Button>
            </div>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
              <div><span style={{ color: 'var(--muted)' }}>Country</span><div style={{ fontWeight: 600, marginTop: 2 }}>{biz.country}</div></div>
              <div><span style={{ color: 'var(--muted)' }}>Type</span><div style={{ fontWeight: 600, marginTop: 2 }}>{biz.business_type}</div></div>
              <div><span style={{ color: 'var(--muted)' }}>Joined</span><div style={{ fontWeight: 600, marginTop: 2 }}>{fmtDate(biz.created_at)}</div></div>
              <div><span style={{ color: 'var(--muted)' }}>Total scans</span><div style={{ fontWeight: 600, marginTop: 2 }}>{fmtNum(biz.total_scans)}</div></div>
            </div>
          </Card>

          <Card padding={20}>
            <SectionHeader title="Subscription"/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Plan</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PlanBadge plan={sub.plan} size="md"/>
                  <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(sub.amount_cents)}<span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>/mo</span></span>
                </div>
              </div>
              {[
                ['Status',          <StatusBadge status={sub.status}/>],
                ['Provider',        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sub.provider}</code>],
                ['Provider ID',     <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{sub.provider_id}</code>],
                ['Current period',  `${fmtDate('2025-02-27')} → ${fmtDate(sub.current_period_end)}`],
                ['Cancel at end',   sub.cancel_at_end ? <strong style={{ color: 'var(--warning-ink)' }}>Yes</strong> : <span style={{ color: 'var(--muted)' }}>off</span>],
                ['Created',         fmtDate(sub.created_at)],
                ['Lifetime value',  <strong>{fmtMoney(sub.amount_cents * 6)}</strong>],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <span style={{ color: 'var(--ink-2)' }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right col — invoices */}
        <Card padding={0}>
          <div style={{ padding: '18px 20px' }}>
            <SectionHeader
              title="Invoice history"
              subtitle="Last 7 invoices · all paid"
              actions={
                <>
                  <Button variant="ghost" size="sm" icon={<Ico.Download size={12}/>}>Export</Button>
                  <Button variant="ghost" size="sm" icon={<Ico.Check size={12}/>}>Mark paid</Button>
                </>
              }/>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Invoice</Th>
                <Th>Provider ID</Th>
                <Th align="right">Amount</Th>
                <Th>Currency</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th align="right">PDF</Th>
              </tr>
            </thead>
            <tbody>
              {INVOICES_MOSAIC.map(inv => (
                <Tr key={inv.id}>
                  <Td mono>{inv.id}</Td>
                  <Td mono muted>{inv.provider_inv_id}</Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtMoney(inv.amount_cents, inv.currency)}</Td>
                  <Td><span style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{inv.currency}</span></Td>
                  <Td><StatusBadge status={inv.status}/></Td>
                  <Td muted>{fmtDate(inv.created_at)}</Td>
                  <Td align="right">
                    <a href={inv.pdf_url} style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Download <Ico.Download size={12}/>
                    </a>
                  </Td>
                </Tr>
              ))}
              <tr>
                <Td colSpan={2}><strong style={{ color: 'var(--ink)' }}>Total · 7 invoices</strong></Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{fmtMoney(INVOICES_MOSAIC.reduce((s, i) => s + i.amount_cents, 0))}</Td>
                <Td colSpan={4}></Td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <ChangePlanModal open={showPlanModal} onClose={() => setShowPlanModal(false)} businessName={biz.name} currentPlan={sub.plan}/>
    </Shell>
  );
};

Object.assign(window, { SubscriptionsListScreen, SubscriptionDetailScreen });
