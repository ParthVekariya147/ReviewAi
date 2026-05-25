// screens-businesses.jsx — Businesses list with full filters, sorting, bulk actions

const BusinessesListScreen = ({ shellProps, onOpenBusiness }) => {
  const [search, setSearch] = React.useState('');
  const [planFilter, setPlanFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState({ key: 'created_at', dir: 'desc' });
  const [selected, setSelected] = React.useState(new Set());
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    let rows = [...BUSINESSES];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(b => b.name.toLowerCase().includes(q) || b.owner_email.toLowerCase().includes(q));
    }
    if (planFilter !== 'all') rows = rows.filter(b => b.plan === planFilter);
    if (statusFilter !== 'all') rows = rows.filter(b => b.status === statusFilter);
    rows.sort((a, b) => {
      const va = a[sortBy.key], vb = b[sortBy.key];
      if (va < vb) return sortBy.dir === 'asc' ? -1 : 1;
      if (va > vb) return sortBy.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [search, planFilter, statusFilter, sortBy]);

  const toggleSort = (key) => {
    setSortBy(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };
  const toggleSelect = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(b => b.id)));
  };

  const activeFilters = [
    planFilter   !== 'all' && { k: 'plan',   label: `Plan: ${planFilter}`,     clear: () => setPlanFilter('all') },
    statusFilter !== 'all' && { k: 'status', label: `Status: ${statusFilter}`, clear: () => setStatusFilter('all') },
  ].filter(Boolean);

  return (
    <Shell
      {...shellProps}
      active="businesses"
      breadcrumbs={['Admin', 'Businesses']}
      pageTitle="Businesses"
      pageActions={
        <>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export CSV</Button>
          <Button variant="primary" icon={<Ico.Plus size={14}/>}>Invite business</Button>
        </>
      }
    >
      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 340 }}>
          <Input
            icon={<Ico.Search/>}
            placeholder="Search business name or owner email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={planFilter} onChange={setPlanFilter} prefix="Plan:"
          options={[
            { value: 'all', label: 'All plans' },
            ...PLANS.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })),
          ]}/>
        <Select value={statusFilter} onChange={setStatusFilter} prefix="Status:"
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'past_due', label: 'Past due' },
            { value: 'canceled', label: 'Canceled' },
            { value: 'trialing', label: 'Trialing' },
          ]}/>
        <Button variant="secondary" icon={<Ico.Filter size={14}/>}>More filters</Button>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> of {TOTAL_BUSINESSES.toLocaleString()} businesses
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active filters</span>
          {activeFilters.map((f, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 4px 3px 8px', fontSize: 12, fontWeight: 500,
              background: 'var(--accent-soft)', color: 'var(--accent-ink)',
              borderRadius: 'var(--radius-xs)',
            }}>
              {f.label}
              <button onClick={f.clear} style={{ width: 16, height: 16, border: 'none', borderRadius: 3, background: 'rgba(0,0,0,0.06)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'inherit' }}>
                <Ico.X size={10}/>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', marginBottom: 12,
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--accent-ink)',
        }}>
          <Checkbox checked indeterminate={selected.size !== filtered.length} onChange={toggleAll}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <div style={{ flex: 1 }}/>
          <Button size="sm" variant="secondary" icon={<Ico.Download size={12}/>}>Export selected</Button>
          <Button size="sm" variant="secondary" icon={<Ico.Pause size={12}/>}>Bulk suspend</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th width={36}>
              <Checkbox
                checked={selected.size > 0 && selected.size === filtered.length}
                indeterminate={selected.size > 0 && selected.size !== filtered.length}
                onChange={toggleAll}/>
            </Th>
            <Th sortable sortDir={sortBy.key === 'name' ? sortBy.dir : null} onSort={() => toggleSort('name')}>Business name</Th>
            <Th sortable sortDir={sortBy.key === 'owner_email' ? sortBy.dir : null} onSort={() => toggleSort('owner_email')}>Owner email</Th>
            <Th sortable sortDir={sortBy.key === 'plan' ? sortBy.dir : null} onSort={() => toggleSort('plan')}>Plan</Th>
            <Th sortable sortDir={sortBy.key === 'status' ? sortBy.dir : null} onSort={() => toggleSort('status')}>Status</Th>
            <Th sortable sortDir={sortBy.key === 'qr_campaigns' ? sortBy.dir : null} onSort={() => toggleSort('qr_campaigns')} align="right">QR Campaigns</Th>
            <Th sortable sortDir={sortBy.key === 'total_scans' ? sortBy.dir : null} onSort={() => toggleSort('total_scans')} align="right">Total Scans</Th>
            <Th sortable sortDir={sortBy.key === 'created_at' ? sortBy.dir : null} onSort={() => toggleSort('created_at')}>Created</Th>
            <Th align="right" width={50}></Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><Td colSpan={9}><EmptyState title="No businesses match your filters" subtitle="Try adjusting search, plan or status."/></Td></tr>
          )}
          {filtered.map(b => (
            <Tr key={b.id} selected={selected.has(b.id)} onClick={() => onOpenBusiness && onOpenBusiness(b.id)}>
              <Td>
                <Checkbox checked={selected.has(b.id)} onChange={() => toggleSelect(b.id)}/>
              </Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar initials={b.logo_initials} color={b.brand_color} size={32} square/>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{b.id}</div>
                  </div>
                </div>
              </Td>
              <Td muted>{b.owner_email}</Td>
              <Td><PlanBadge plan={b.plan}/></Td>
              <Td><StatusBadge status={b.status}/></Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{b.qr_campaigns}</Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{fmtNum(b.total_scans)}</Td>
              <Td muted>{fmtDate(b.created_at)}</Td>
              <Td align="right">
                <button style={{ width: 26, height: 26, border: '1px solid transparent', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={e => e.stopPropagation()}><Ico.More size={14}/></button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <div style={{ marginTop: 0 }}>
        <Pagination page={page} pageSize={25} total={TOTAL_BUSINESSES} onPageChange={setPage}/>
      </div>
    </Shell>
  );
};

Object.assign(window, { BusinessesListScreen });
