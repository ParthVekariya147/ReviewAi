// screens-audit.jsx — Full audit log table

const AuditLogsScreen = ({ shellProps }) => {
  const [actionFilter, setActionFilter] = React.useState('all');
  const [actorFilter, setActorFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const filtered = FULL_AUDIT.filter(a => {
    if (actionFilter !== 'all' && a.action !== actionFilter) return false;
    if (actorFilter !== 'all' && a.actor !== actorFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.actor.toLowerCase().includes(q) || a.target_name.toLowerCase().includes(q) || a.action.toLowerCase().includes(q);
    }
    return true;
  });

  const actions = [...new Set(FULL_AUDIT.map(a => a.action))];
  const actors = [...new Set(FULL_AUDIT.map(a => a.actor))];

  return (
    <Shell
      {...shellProps}
      active="audit"
      breadcrumbs={['Admin', 'Audit Logs']}
      pageTitle="Audit Logs"
      pageActions={
        <>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export CSV</Button>
          <Button variant="secondary" icon={<Ico.Filter size={14}/>}>Saved views</Button>
        </>
      }
    >
      {/* Summary chip row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { label: 'All events',        count: FULL_AUDIT.length,                            active: actionFilter === 'all', onClick: () => setActionFilter('all') },
          { label: 'plan.changed',      count: FULL_AUDIT.filter(a => a.action === 'plan.changed').length,      active: actionFilter === 'plan.changed', onClick: () => setActionFilter('plan.changed') },
          { label: 'business.suspended',count: FULL_AUDIT.filter(a => a.action === 'business.suspended').length,active: actionFilter === 'business.suspended', onClick: () => setActionFilter('business.suspended') },
          { label: 'invoice.paid',      count: FULL_AUDIT.filter(a => a.action === 'invoice.paid').length,      active: actionFilter === 'invoice.paid', onClick: () => setActionFilter('invoice.paid') },
          { label: 'qr.paused',         count: FULL_AUDIT.filter(a => a.action === 'qr.paused').length,         active: actionFilter === 'qr.paused', onClick: () => setActionFilter('qr.paused') },
          { label: 'business.created',  count: FULL_AUDIT.filter(a => a.action === 'business.created').length,  active: actionFilter === 'business.created', onClick: () => setActionFilter('business.created') },
        ].map((p, i) => (
          <button key={i} onClick={p.onClick} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', fontSize: 12, fontWeight: 600,
            borderRadius: 999,
            border: '1px solid ' + (p.active ? 'var(--accent)' : 'var(--border-strong)'),
            background: p.active ? 'var(--accent-soft)' : 'var(--surface)',
            color: p.active ? 'var(--accent-ink)' : 'var(--ink-2)',
            cursor: 'pointer',
            fontFamily: p.label === 'All events' ? 'inherit' : 'var(--font-mono)',
          }}>
            {p.label}
            <span style={{
              padding: '0 6px', fontSize: 11, borderRadius: 999,
              background: p.active ? 'rgba(110,91,255,0.18)' : 'var(--surface-2)',
              color: p.active ? 'var(--accent-ink)' : 'var(--muted)',
            }}>{p.count}</span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, maxWidth: 340 }}>
          <Input icon={<Ico.Search/>} placeholder="Search actor, target or action…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Select value={actorFilter} onChange={setActorFilter} prefix="Actor:"
          options={[{ value: 'all', label: 'All actors' }, ...actors.map(a => ({ value: a, label: a }))]}/>
        <Select value="all" onChange={() => {}} prefix="Target:"
          options={[{ value: 'all', label: 'All types' }, { value: 'business', label: 'business' }, { value: 'subscription', label: 'subscription' }, { value: 'qr_code', label: 'qr_code' }, { value: 'invoice', label: 'invoice' }]}/>
        <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', overflow: 'hidden', background: 'var(--surface)' }}>
          {['24h', '7d', '30d', '90d'].map(r => (
            <button key={r} style={{ padding: '6px 10px', fontSize: 12, fontWeight: 600, height: 32, border: 'none', background: r === '7d' ? 'var(--accent-soft)' : 'transparent', color: r === '7d' ? 'var(--accent-ink)' : 'var(--muted)', cursor: 'pointer' }}>{r}</button>
          ))}
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> events
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Actor</Th>
            <Th>Action</Th>
            <Th>Target</Th>
            <Th>Meta</Th>
            <Th>Timestamp</Th>
            <Th align="right" width={50}></Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><Td colSpan={6}><EmptyState title="No audit events match your filters" subtitle="Try widening date range or clearing action filter."/></Td></tr>
          )}
          {filtered.map(a => (
            <Tr key={a.id}>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar
                    initials={a.actor === 'system' ? 'S' : a.actor.slice(0, 2).toUpperCase()}
                    color={a.actor === 'system' ? 'var(--muted)' : 'var(--accent-gradient)'}
                    size={26}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.actor === 'system' ? <span style={{ color: 'var(--muted)' }}>system</span> : a.actor}</div>
                  </div>
                </div>
              </Td>
              <Td><ActionBadge action={a.action}/></Td>
              <Td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontWeight: 500 }}>{a.target_name}</span>
                  <code style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                    {a.target_type}<span style={{ color: 'var(--muted-2)' }}>/</span>{a.target_id}
                  </code>
                </div>
              </Td>
              <Td>
                <code style={{
                  display: 'inline-block', maxWidth: 280, padding: '2px 8px',
                  background: 'var(--surface-2)', borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-2)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{JSON.stringify(a.meta)}</code>
              </Td>
              <Td muted style={{ fontVariantNumeric: 'tabular-nums' }}>{a.created_at}</Td>
              <Td align="right">
                <button style={{ width: 26, height: 26, border: '1px solid transparent', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ico.External size={12}/>
                </button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Shell>
  );
};

Object.assign(window, { AuditLogsScreen });
