// screens-ai.jsx — AI Usage Dashboard

const AIUsageScreen = ({ shellProps }) => {
  const T = useThemeTokens();
  const [range, setRange] = React.useState('30d');

  // 30 days of AI request volume + cost
  const aiData = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < 30; i++) {
      const dow = (i + 4) % 7;
      const weekend = (dow === 0 || dow === 6) ? 0.6 : 1.0;
      const trend = 1 + (i / 30) * 0.5;
      const wiggle = 1 + Math.sin((i + 2) * 1.3) * 0.12;
      const reqs = Math.round(8000 * weekend * trend * wiggle);
      out.push({
        date: new Date(2025, 1, 1 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: reqs,
        failed: Math.max(0, Math.round(reqs * (0.015 + Math.sin(i) * 0.008))),
        cost: +(reqs * 0.00038).toFixed(2),
      });
    }
    return out;
  }, []);

  return (
    <Shell
      {...shellProps}
      active="ai"
      breadcrumbs={['Admin', 'AI Usage']}
      pageTitle="AI Usage Dashboard"
      pageActions={
        <>
          <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden', background: 'var(--surface)' }}>
            {['7d', '30d', '90d'].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600, height: 32, border: 'none',
                background: range === r ? 'var(--accent-soft)' : 'transparent',
                color: range === r ? 'var(--accent-ink)' : 'var(--muted)', cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
          <Button variant="secondary" icon={<Ico.Settings size={14}/>}>Model settings</Button>
        </>
      }>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard variant="gradient" label="AI requests (30d)" value="284,712"  delta="+19.4%" deltaDir="up"   icon={<Ico.AI/>}/>
        <StatCard variant="flat"     label="Tokens used"       value="412.8M"   delta="+22.1%" deltaDir="up"   icon={<Ico.Sparkles/>}/>
        <StatCard variant="flat"     label="Failed generations" value="1,184"    delta="+4.2%"  deltaDir="up"   icon={<Ico.ShieldAlert/>} sublabel="0.41% error rate"/>
        <StatCard variant="flat"     label="Refresh rate"       value="22.4%"    delta="-1.8%"  deltaDir="down" icon={<Ico.Sparkles/>} sublabel="refresh / generate"/>
        <StatCard variant="flat"     label="Inference cost"     value="$1,083"   delta="+18.2%" deltaDir="up"   icon={<Ico.Revenue/>}  sublabel="$0.0038 / request"/>
      </div>

      {/* Daily AI requests chart */}
      <Card padding={0} style={{ marginBottom: 16 }}>
        <div style={{ padding: '18px 20px 8px' }}>
          <SectionHeader title="AI requests · last 30 days"
            subtitle="Successful vs failed generation requests"
            actions={
              <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><span style={{ width: 10, height: 3, background: 'var(--accent-gradient)', borderRadius: 2 }}/>Requests</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}><span style={{ width: 10, height: 3, background: 'var(--danger)', borderRadius: 2 }}/>Failed</span>
              </div>
            }/>
        </div>
        <div style={{ padding: '0 12px 12px', height: 240 }}>
          <Recharts.ResponsiveContainer>
            <Recharts.ComposedChart data={aiData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={T.accent}  stopOpacity={0.35}/>
                  <stop offset="100%" stopColor={T.accent2} stopOpacity={0.02}/>
                </linearGradient>
                <linearGradient id="aiLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={T.accent}/>
                  <stop offset="100%" stopColor={T.accent2}/>
                </linearGradient>
              </defs>
              <Recharts.CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false}/>
              <Recharts.XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} interval={4}/>
              <Recharts.YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={50}/>
              <Recharts.Tooltip content={<ChartTip/>}/>
              <Recharts.Area type="monotone" dataKey="requests" name="Requests" stroke="url(#aiLine)" strokeWidth={2.2} fill="url(#aiGrad)"/>
              <Recharts.Bar dataKey="failed" name="Failed" fill={T.danger} barSize={4} radius={[2,2,0,0]}/>
            </Recharts.ComposedChart>
          </Recharts.ResponsiveContainer>
        </div>
      </Card>

      {/* Heavy users + Model breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={0}>
          <div style={{ padding: '18px 20px' }}>
            <SectionHeader title="High-usage businesses"
              subtitle="Top 8 businesses by AI request volume · last 30 days"
              actions={<Button variant="ghost" size="sm" icon={<Ico.Filter size={12}/>}>Flag thresholds</Button>}/>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Business</Th>
                <Th>Plan</Th>
                <Th align="right">Requests</Th>
                <Th align="right">Tokens</Th>
                <Th align="right">Cost</Th>
                <Th>% of plan limit</Th>
              </tr>
            </thead>
            <tbody>
              {[
                { biz: 'Cedar Creek Veterinary',    initials: 'CV', color: '#16A34A', plan: 'enterprise', reqs: 18394, tokens: 26.6, cost: 70.10, used: null },
                { biz: 'Stonebridge Family Clinic', initials: 'SF', color: '#2F7DFB', plan: 'enterprise', reqs: 14210, tokens: 20.5, cost: 54.02, used: null },
                { biz: 'Mosaic Coffee Roasters',    initials: 'MC', color: '#6D4C2E', plan: 'pro',        reqs:  9614, tokens: 13.9, cost: 36.53, used: 0.96 },
                { biz: 'Sunrise Bakery & Café',     initials: 'SB', color: '#E2A52F', plan: 'pro',        reqs:  8420, tokens: 12.2, cost: 32.00, used: 0.84 },
                { biz: 'Bishopsgate Dental',        initials: 'BD', color: '#6E5BFF', plan: 'pro',        reqs:  7203, tokens: 10.4, cost: 27.37, used: 0.72 },
                { biz: 'Olive Branch Mediterranean',initials: 'OB', color: '#6E5BFF', plan: 'pro',        reqs:  6321, tokens:  9.1, cost: 24.02, used: 0.63 },
                { biz: 'Bloom & Vine Florist',      initials: 'BV', color: '#7C3AED', plan: 'pro',        reqs:  5712, tokens:  8.3, cost: 21.71, used: 0.57 },
                { biz: 'Twin Pines Pediatrics',     initials: 'TP', color: '#16A34A', plan: 'pro',        reqs:  5128, tokens:  7.4, cost: 19.49, used: 0.51 },
              ].map((b, i) => (
                <Tr key={i}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={b.initials} color={b.color} size={28} square/>
                      <span style={{ fontWeight: 600 }}>{b.biz}</span>
                    </div>
                  </Td>
                  <Td><PlanBadge plan={b.plan}/></Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{fmtNum(b.reqs)}</Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-2)' }}>{b.tokens}M</Td>
                  <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>${b.cost.toFixed(2)}</Td>
                  <Td>
                    {b.used === null ? (
                      <span style={{ display: 'inline-flex', padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 'var(--radius-xs)', background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>Unlimited</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${b.used*100}%`, height: '100%', background: b.used > 0.85 ? 'var(--warning)' : 'var(--accent)' }}/>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: b.used > 0.85 ? 'var(--warning-ink)' : 'var(--ink-2)', minWidth: 32, textAlign: 'right' }}>{Math.round(b.used*100)}%</span>
                      </div>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Model breakdown */}
          <Card padding={20}>
            <SectionHeader title="Models in use" subtitle="Last 30 days"/>
            {[
              { model: 'claude-haiku-4-5',  reqs: 184123, share: 0.647, cost: 567.21 },
              { model: 'claude-sonnet-4-5', reqs: 84218,  share: 0.296, cost: 412.18 },
              { model: 'gpt-4o-mini',       reqs: 16371,  share: 0.057, cost: 103.84 },
            ].map((m, i) => (
              <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{m.model}</code>
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{fmtNum(m.reqs)}</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${m.share*100}%`, height: '100%', background: i === 0 ? 'var(--accent-gradient)' : i === 1 ? 'var(--accent)' : 'var(--info)' }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  <span>{Math.round(m.share*100)}% of requests</span>
                  <span>${m.cost.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Refresh-abuse alerts */}
          <Card padding={20}>
            <SectionHeader title="Refresh abuse alerts"
              subtitle="Businesses with > 80% refresh rate"
              actions={
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, borderRadius: 'var(--radius-xs)', background: 'var(--danger-soft)', color: 'var(--danger-ink)' }}>
                  <Ico.ShieldAlert size={12}/>3 new
                </span>
              }/>
            {[
              { biz: 'Cascade Cleaners',     initials: 'CC', color: '#0EA5E9', rate: 0.94, sev: 'critical' },
              { biz: 'Brick Lane Tattoo',    initials: 'BT', color: '#0A0A14', rate: 0.71, sev: 'high' },
              { biz: 'Phoenix Print Shop',   initials: 'PP', color: '#DC2626', rate: 0.68, sev: 'medium' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                <Avatar initials={a.initials} color={a.color} size={28} square/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{a.biz}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Refresh rate: <strong style={{ color: 'var(--danger-ink)' }}>{Math.round(a.rate*100)}%</strong></div>
                </div>
                <SeverityBadge severity={a.sev}/>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Bottom: prompt config + recent errors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card padding={20}>
          <SectionHeader title="Generation parameters"
            subtitle="Platform-wide AI configuration"
            actions={<Button variant="ghost" size="sm" iconRight={<Ico.External size={12}/>}>Open settings</Button>}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            {[
              ['Default model',     <code style={{ fontFamily: 'var(--font-mono)' }}>claude-haiku-4-5</code>],
              ['Fallback model',    <code style={{ fontFamily: 'var(--font-mono)' }}>gpt-4o-mini</code>],
              ['Max tokens',        '1,024'],
              ['Drafts per request','2'],
              ['Temperature',       '0.75'],
              ['Refresh limit',     '4 per scan'],
              ['Timeout',           '12s'],
              ['Content filter',    <span style={{ display: 'inline-flex', padding: '2px 8px', fontSize: 11, fontWeight: 600, borderRadius: 'var(--radius-xs)', background: 'var(--success-soft)', color: 'var(--success-ink)' }}>Strict</span>],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={0}>
          <div style={{ padding: '18px 20px' }}>
            <SectionHeader title="Recent failures"
              subtitle="Last 5 failed generations · 1,184 in 30 days"/>
          </div>
          <div>
            {[
              { biz: 'Lighthouse Family Dental', code: 'timeout',           detail: 'Inference exceeded 12s budget',          when: '4 min ago' },
              { biz: 'Quokka Coffee',            code: 'content_filter',    detail: 'Generated text contained flagged terms', when: '12 min ago' },
              { biz: 'Wildflower Boutique',      code: 'rate_limit',        detail: 'Free plan: 100 reviews / month reached', when: '38 min ago' },
              { biz: 'Mountain Pine Yoga',       code: 'upstream_error',    detail: 'Anthropic API returned 503',              when: '1 hr ago' },
              { biz: 'Skyline Camera Repair',    code: 'invalid_keywords',  detail: 'review_keywords field was empty',        when: '2 hr ago' },
            ].map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                <span style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--danger-soft)', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><Ico.ShieldAlert size={14}/></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: 'var(--danger-ink)', padding: '1px 6px', background: 'var(--danger-soft)', borderRadius: 4 }}>{e.code}</code>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{e.biz}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{e.detail}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{e.when}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
};

Object.assign(window, { AIUsageScreen });
