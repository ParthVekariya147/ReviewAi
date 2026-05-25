// screens-revenue.jsx — Revenue Dashboard with MRR/ARR/Churn focus

const REVENUE_BY_MONTH = [
  { month: 'Sep', mrr: 28400, new_mrr: 4200, churned: 800,  expansion: 1100 },
  { month: 'Oct', mrr: 31200, new_mrr: 3800, churned: 1000, expansion: 1200 },
  { month: 'Nov', mrr: 35800, new_mrr: 5100, churned: 700,  expansion:  900 },
  { month: 'Dec', mrr: 39100, new_mrr: 4200, churned: 900,  expansion: 1200 },
  { month: 'Jan', mrr: 43700, new_mrr: 5600, churned: 1000, expansion: 1400 },
  { month: 'Feb', mrr: 48324, new_mrr: 5824, churned: 1100, expansion: 1500 },
];

const RevenueDashboardScreen = ({ shellProps }) => {
  const T = useThemeTokens();
  const [range, setRange] = React.useState('6m');

  // Plan performance — revenue per plan
  const planRev = [
    { plan: 'enterprise', count:  44, price: 199, total: 44 * 199 * 100 },
    { plan: 'pro',        count: 287, price:  49, total: 287 * 49 * 100 },
    { plan: 'starter',    count: 312, price:  19, total: 312 * 19 * 100 },
  ];
  const totalPlanRev = planRev.reduce((s, p) => s + p.total, 0);

  return (
    <Shell
      {...shellProps}
      active="revenue"
      breadcrumbs={['Admin', 'Revenue']}
      pageTitle="Revenue Dashboard"
      pageActions={
        <>
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden', background: 'var(--surface)' }}>
            {['3m', '6m', '12m', 'YTD'].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600, height: 32,
                border: 'none', background: range === r ? 'var(--accent-soft)' : 'transparent',
                color: range === r ? 'var(--accent-ink)' : 'var(--muted)', cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export</Button>
          <Button variant="primary" icon={<Ico.External size={14}/>}>Open in Stripe</Button>
        </>
      }>

      {/* Headline KPIs — hero gradient + companions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          padding: 24,
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-gradient)',
          color: '#fff',
          boxShadow: '0 16px 36px -18px rgba(110,91,255,0.55)',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }}/>
          <div style={{ position: 'absolute', bottom: -70, left: -20, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
          <div style={{ position: 'relative', fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Recurring Revenue</div>
          <div style={{ position: 'relative', fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, marginTop: 6 }}>$48,324</div>
          <div style={{ position: 'relative', marginTop: 14, display: 'flex', gap: 16, fontSize: 12 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>Net new</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>+$4,624</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>Churn</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>-$1,100</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>Expansion</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>+$1,500</div>
            </div>
          </div>
        </div>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.Revenue/></span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Annual Run Rate (ARR)</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>$579,888</div>
          <div style={{ marginTop: 8, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 'var(--radius-xs)', background: 'var(--success-soft)', color: 'var(--success-ink)', fontWeight: 600 }}>
              <Ico.ArrowUp size={12} sw={2.5}/>+82%
            </span>
            <span style={{ color: 'var(--muted)' }}>YoY</span>
          </div>
        </Card>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--warning-soft)', color: 'var(--warning-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.ArrowDown/></span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Net revenue churn</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>2.3%</div>
          <div style={{ marginTop: 8, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 'var(--radius-xs)', background: 'var(--success-soft)', color: 'var(--success-ink)', fontWeight: 600 }}>
              <Ico.ArrowDown size={12} sw={2.5}/>-0.4%
            </span>
            <span style={{ color: 'var(--muted)' }}>vs Jan</span>
          </div>
        </Card>
        <Card padding={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--success-soft)', color: 'var(--success-ink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.Check/></span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Payment success</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>96.8%</div>
          <div style={{ marginTop: 8, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--muted)' }}>14 failed · 4 retrying</span>
          </div>
        </Card>
      </div>

      {/* Revenue trend chart + plan breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '18px 20px 8px' }}>
            <SectionHeader title="MRR over time · 6 months"
              subtitle="Net new MRR, expansion, and churn breakdown"
              actions={
                <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }}/>New</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent-2)' }}/>Expansion</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger)' }}/>Churn</span>
                </div>
              }/>
          </div>
          <div style={{ padding: '0 16px 16px', height: 280 }}>
            <Recharts.ResponsiveContainer>
              <Recharts.ComposedChart data={REVENUE_BY_MONTH} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="mrrLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={T.accent}/>
                    <stop offset="100%" stopColor={T.accent2}/>
                  </linearGradient>
                </defs>
                <Recharts.CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false}/>
                <Recharts.XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false}/>
                <Recharts.YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
                <Recharts.Tooltip content={<ChartTip/>}/>
                <Recharts.Bar dataKey="new_mrr" name="New" stackId="d" fill={T.accent} radius={[0,0,0,0]} barSize={28}/>
                <Recharts.Bar dataKey="expansion" name="Expansion" stackId="d" fill={T.accent2} barSize={28}/>
                <Recharts.Bar dataKey="churned" name="Churn" stackId="d" fill={T.danger} barSize={28}/>
                <Recharts.Line type="monotone" dataKey="mrr" name="MRR" stroke="url(#mrrLineGrad)" strokeWidth={2.5} dot={{ fill: T.accent, r: 4 }}/>
              </Recharts.ComposedChart>
            </Recharts.ResponsiveContainer>
          </div>
        </Card>

        <Card padding={20}>
          <SectionHeader title="Revenue by plan" subtitle="MRR breakdown · Feb 2025"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {planRev.map(p => {
              const pct = p.total / totalPlanRev;
              return (
                <div key={p.plan}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <PlanBadge plan={p.plan}/>
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--muted)' }}>{p.count} businesses · ${p.price}/mo</span>
                    <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(p.total)}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct*100}%`, height: '100%', background: p.plan === 'enterprise' ? 'var(--accent-gradient)' : p.plan === 'pro' ? 'var(--accent)' : 'var(--info)', borderRadius: 4 }}/>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{Math.round(pct*100)}% of MRR</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Total · Feb</span>
            <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{fmtMoney(totalPlanRev)}</span>
          </div>
        </Card>
      </div>

      {/* Bottom: Recent invoices + failed payments + plan upgrades */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '18px 20px' }}>
            <SectionHeader title="Recent paid invoices"
              actions={<Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>}>All invoices</Button>}/>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Invoice</Th>
                <Th>Business</Th>
                <Th>Plan</Th>
                <Th align="right">Amount</Th>
                <Th>Paid</Th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'inv_8721', biz: 'Mosaic Coffee Roasters', initials: 'MC', color: '#6D4C2E', plan: 'pro',        amt: 4900,  when: '2 hrs ago' },
                { id: 'inv_8720', biz: 'Cedar Creek Veterinary', initials: 'CV', color: '#16A34A', plan: 'enterprise', amt: 19900, when: '4 hrs ago' },
                { id: 'inv_8719', biz: 'Bishopsgate Dental',     initials: 'BD', color: '#6E5BFF', plan: 'pro',        amt: 4900,  when: '6 hrs ago' },
                { id: 'inv_8718', biz: 'Riverbed Brewing Co.',   initials: 'RB', color: '#D97706', plan: 'pro',        amt: 4900,  when: '8 hrs ago' },
                { id: 'inv_8717', biz: 'Loom Yoga Studio',       initials: 'LY', color: '#0EA5E9', plan: 'pro',        amt: 4900,  when: '11 hrs ago' },
                { id: 'inv_8716', biz: 'Stonebridge Family Clinic', initials: 'SF', color: '#2F7DFB', plan: 'enterprise', amt: 19900, when: '14 hrs ago' },
              ].map(i => (
                <Tr key={i.id}>
                  <Td mono>{i.id}</Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar initials={i.initials} color={i.color} size={24} square/>
                      <span style={{ fontSize: 13 }}>{i.biz}</span>
                    </div>
                  </Td>
                  <Td><PlanBadge plan={i.plan}/></Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{fmtMoney(i.amt)}</Td>
                  <Td muted>{i.when}</Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card padding={20}>
          <SectionHeader title="Failed payments · needs action"
            subtitle="14 subscriptions in dunning · $498 at risk"/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { biz: 'Tide & Toast Diner',  initials: 'TT', color: '#DC2626', plan: 'starter', amt: 1900, attempt: 'Attempt 2/4 · retry in 2 days', reason: 'card_declined' },
              { biz: 'Twin Pines Pediatrics', initials: 'TP', color: '#16A34A', plan: 'pro',     amt: 4900, attempt: 'Attempt 1/4 · retry in 1 day',  reason: 'insufficient_funds' },
              { biz: 'Periwinkle Daycare',   initials: 'PD', color: '#6E5BFF', plan: 'starter', amt: 1900, attempt: 'Attempt 3/4 · final retry tomorrow', reason: 'expired_card' },
              { biz: 'Goldhill Barbershop',  initials: 'GB', color: '#0A0A14', plan: 'starter', amt: 1900, attempt: 'Attempt 2/4 · retry in 3 days', reason: 'processing_error' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                <Avatar initials={f.initials} color={f.color} size={32} square/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.biz}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.attempt} · <code style={{ fontFamily: 'var(--font-mono)' }}>{f.reason}</code></div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'var(--danger-ink)' }}>{fmtMoney(f.amt)}</div>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} icon={<Ico.External size={12}/>}>View all in Stripe</Button>
        </Card>
      </div>
    </Shell>
  );
};

Object.assign(window, { RevenueDashboardScreen });
