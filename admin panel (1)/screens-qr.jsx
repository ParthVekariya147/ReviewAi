// screens-qr.jsx — Platform-wide QR Management

const PLATFORM_QR_CODES = [
  { id: 'qr_8821', business: 'Cedar Creek Veterinary',    business_id: 'biz_0004', initials: 'CV', color: '#16A34A', token: 'cv-lobby-counter',  campaign_name: 'Lobby Counter QR',     status: 'live',   dynamic: true,  ab_testing: true,  scans: 4218, copy_rate: 0.74, created_at: '2024-07-22' },
  { id: 'qr_8820', business: 'Stonebridge Family Clinic', business_id: 'biz_0016', initials: 'SF', color: '#2F7DFB', token: 'sf-reception',     campaign_name: 'Reception Desk',       status: 'live',   dynamic: true,  ab_testing: false, scans: 3812, copy_rate: 0.69, created_at: '2024-05-11' },
  { id: 'qr_8819', business: 'Mosaic Coffee Roasters',    business_id: 'biz_0009', initials: 'MC', color: '#6D4C2E', token: 'mc-bag-sticker',   campaign_name: 'Bean Bag Sticker',     status: 'live',   dynamic: true,  ab_testing: false, scans: 3204, copy_rate: 0.71, created_at: '2024-04-08' },
  { id: 'qr_8818', business: 'Sunrise Bakery & Café',     business_id: 'biz_0001', initials: 'SB', color: '#E2A52F', token: 'sb-front-door',    campaign_name: 'Front Door Counter',   status: 'live',   dynamic: true,  ab_testing: true,  scans: 4218, copy_rate: 0.71, created_at: '2024-08-14' },
  { id: 'qr_8817', business: 'Bishopsgate Dental',        business_id: 'biz_0007', initials: 'BD', color: '#6E5BFF', token: 'bd-waiting-room',  campaign_name: 'Waiting Room Card',    status: 'live',   dynamic: true,  ab_testing: false, scans: 2891, copy_rate: 0.68, created_at: '2024-05-20' },
  { id: 'qr_8816', business: 'Loom Yoga Studio',          business_id: 'biz_0006', initials: 'LY', color: '#0EA5E9', token: 'ly-mat-pocket',    campaign_name: 'Mat Pocket Insert',    status: 'live',   dynamic: true,  ab_testing: false, scans: 2104, copy_rate: 0.62, created_at: '2024-07-09' },
  { id: 'qr_8815', business: 'Olive Branch Mediterranean',business_id: 'biz_0013', initials: 'OB', color: '#6E5BFF', token: 'ob-table-tent',    campaign_name: 'Table Tent',           status: 'live',   dynamic: true,  ab_testing: true,  scans: 1842, copy_rate: 0.66, created_at: '2024-08-30' },
  { id: 'qr_8814', business: 'Bloom & Vine Florist',      business_id: 'biz_0003', initials: 'BV', color: '#7C3AED', token: 'bv-wrap-card',     campaign_name: 'Wrap Card Insert',     status: 'paused', dynamic: true,  ab_testing: false, scans: 1284, copy_rate: 0.58, created_at: '2024-06-30' },
  { id: 'qr_8813', business: 'Riverbed Brewing Co.',      business_id: 'biz_0018', initials: 'RB', color: '#D97706', token: 'rb-coaster',       campaign_name: 'Coaster Print Run 3',  status: 'live',   dynamic: false, ab_testing: false, scans:  984, copy_rate: 0.54, created_at: '2024-09-12' },
  { id: 'qr_8812', business: 'Halcyon Hair Studio',       business_id: 'biz_0014', initials: 'HH', color: '#EC4899', token: 'hh-mirror',        campaign_name: 'Mirror Decal',         status: 'live',   dynamic: true,  ab_testing: false, scans:  742, copy_rate: 0.61, created_at: '2024-09-19' },
  { id: 'qr_8811', business: 'Twin Pines Pediatrics',     business_id: 'biz_0019', initials: 'TP', color: '#16A34A', token: 'tp-discharge',     campaign_name: 'Discharge Folder',     status: 'paused', dynamic: true,  ab_testing: false, scans:  618, copy_rate: 0.49, created_at: '2024-06-04' },
  { id: 'qr_8810', business: 'Nori Sushi Bar',            business_id: 'biz_0020', initials: 'NS', color: '#0A0A14', token: 'ns-receipt',       campaign_name: 'Receipt Footer',       status: 'live',   dynamic: true,  ab_testing: false, scans:  412, copy_rate: 0.66, created_at: '2024-10-28' },
  { id: 'qr_8809', business: 'Iron & Oak Furniture',      business_id: 'biz_0022', initials: 'IO', color: '#6D4C2E', token: 'io-delivery',      campaign_name: 'Delivery Note Card',   status: 'draft',  dynamic: false, ab_testing: false, scans:    0, copy_rate: 0,    created_at: '2025-02-18' },
  { id: 'qr_8808', business: 'Periwinkle Daycare',        business_id: 'biz_0023', initials: 'PD', color: '#6E5BFF', token: 'pd-parent-portal', campaign_name: 'Parent Portal Sticker',status: 'live',   dynamic: true,  ab_testing: true,  scans:  204, copy_rate: 0.71, created_at: '2024-09-29' },
];

// fix typo bullet I made
const _PLATFORM_QR_CODES = PLATFORM_QR_CODES;

const QRManagementScreen = ({ shellProps }) => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [businessFilter, setBusinessFilter] = React.useState('all');
  const [showCreate, setShowCreate] = React.useState(false);
  const [selected, setSelected] = React.useState(new Set());

  const filtered = PLATFORM_QR_CODES.filter(q => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      return q.campaign_name.toLowerCase().includes(s) || q.token.toLowerCase().includes(s) || q.business.toLowerCase().includes(s);
    }
    return true;
  });

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <Shell
      {...shellProps}
      active="qr"
      breadcrumbs={['Admin', 'QR Codes']}
      pageTitle="QR Management"
      pageActions={
        <>
          <Button variant="secondary" icon={<Ico.Download size={14}/>}>Export</Button>
          <Button variant="primary" icon={<Ico.Plus size={14}/>} onClick={() => setShowCreate(true)}>Generate QR</Button>
        </>
      }
    >
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        <StatCard variant="gradient" label="Total QR codes"  value="2,184" delta="+47"     deltaDir="up"   icon={<Ico.QR/>}     sublabel="last 7 days"/>
        <StatCard variant="flat"     label="Live"            value="1,892"  delta="+38"     deltaDir="up"   icon={<Ico.Check/>}/>
        <StatCard variant="flat"     label="Paused"          value="218"    delta="+9"      deltaDir="up"   icon={<Ico.Pause/>}/>
        <StatCard variant="flat"     label="Draft"           value="74"     delta="+0"      deltaDir="up"   icon={<Ico.Archive/>}/>
        <StatCard variant="flat"     label="Dynamic redirect" value="94%"   delta="+1.2%"   deltaDir="up"   icon={<Ico.External/>} sublabel="of live QRs"/>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 340 }}>
          <Input icon={<Ico.Search/>} placeholder="Search campaign, token, or business…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Select value={statusFilter} onChange={setStatusFilter} prefix="Status:"
          options={[{value:'all',label:'All statuses'},{value:'live',label:'Live'},{value:'paused',label:'Paused'},{value:'draft',label:'Draft'}]}/>
        <Select value={businessFilter} onChange={setBusinessFilter} prefix="Business:"
          options={[{value:'all',label:'All businesses'},{value:'top',label:'Top 20 by scans'},{value:'flagged',label:'Has abuse flags'}]}/>
        <Select value="created-desc" onChange={() => {}} prefix="Sort:"
          options={[{value:'created-desc',label:'Newest first'},{value:'scans-desc',label:'Most scans'},{value:'copy-desc',label:'Highest copy rate'}]}/>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> of 2,184 QR codes
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 12,
          background: 'var(--accent-soft)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)', color: 'var(--accent-ink)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} selected</span>
          <div style={{ flex: 1 }}/>
          <Button size="sm" variant="secondary" icon={<Ico.External size={12}/>}>Bulk redirect</Button>
          <Button size="sm" variant="secondary" icon={<Ico.Pause size={12}/>}>Pause</Button>
          <Button size="sm" variant="danger-soft" icon={<Ico.Archive size={12}/>}>Disable</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      <Table>
        <thead>
          <tr>
            <Th width={36}>
              <Checkbox checked={selected.size > 0 && selected.size === filtered.length}
                indeterminate={selected.size > 0 && selected.size !== filtered.length}
                onChange={() => setSelected(s => s.size === filtered.length ? new Set() : new Set(filtered.map(q => q.id)))}/>
            </Th>
            <Th>QR Token</Th>
            <Th>Campaign</Th>
            <Th>Business</Th>
            <Th>Status</Th>
            <Th align="center">Dynamic</Th>
            <Th align="center">A/B</Th>
            <Th align="right">Scans</Th>
            <Th align="right">Copy rate</Th>
            <Th>Created</Th>
            <Th align="right" width={50}></Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(q => (
            <Tr key={q.id} selected={selected.has(q.id)}>
              <Td><Checkbox checked={selected.has(q.id)} onChange={() => toggleSelect(q.id)}/></Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--surface-2)', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.QR size={16}/></span>
                  <div>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>/r/{q.token}</code>
                    <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{q.id}</div>
                  </div>
                </div>
              </Td>
              <Td><span style={{ fontWeight: 500 }}>{q.campaign_name}</span></Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Avatar initials={q.initials} color={q.color} size={22} square/>
                  <span style={{ fontSize: 13 }}>{q.business}</span>
                </div>
              </Td>
              <Td><StatusBadge status={q.status}/></Td>
              <Td align="center">{q.dynamic ? <Ico.Check size={14}/> : <span style={{ color: 'var(--muted-2)' }}>—</span>}</Td>
              <Td align="center">{q.ab_testing ? <span style={{ display: 'inline-flex', padding: '1px 6px', fontSize: 10, fontWeight: 700, borderRadius: 4, background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>A/B</span> : <span style={{ color: 'var(--muted-2)' }}>—</span>}</Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{q.scans > 0 ? fmtNum(q.scans) : <span style={{ color: 'var(--muted-2)' }}>0</span>}</Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{q.scans > 0 ? `${Math.round(q.copy_rate * 100)}%` : '—'}</Td>
              <Td muted>{fmtDate(q.created_at)}</Td>
              <Td align="right">
                <button style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Ico.More size={14}/></button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {/* Create QR side panel modal */}
      <ModalShell open={showCreate} onClose={() => setShowCreate(false)} width={560}>
        <ModalHeader icon={<Ico.QR/>} title="Generate new QR code"
          subtitle="QR codes are admin-generated and assigned to a business. Dynamic redirect lets you change the destination later without reprinting."
          onClose={() => setShowCreate(false)}/>
        <div style={{ padding: '8px 24px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Assign to business</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 40, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
              <Avatar initials="SB" color="#E2A52F" size={22} square/>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>Sunrise Bakery &amp; Café</span>
              <Ico.ChevronDown size={14}/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Campaign name</label>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 40, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
                <input defaultValue="Holiday Promo 2025" style={{ border: 0, outline: 0, flex: 1, fontSize: 13, background: 'transparent', color: 'var(--ink)' }}/>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Token (auto)</label>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 40, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>sb-holiday-25-a8f2</code>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {[
              { k: 'Dynamic redirect', desc: 'Change the redirect destination without reprinting the QR.', on: true },
              { k: 'A/B testing',       desc: 'Show different AI prompts to alternating scans.',           on: false },
              { k: 'Pause fallback',    desc: 'When paused, show a "Coming back soon" page instead of a 404.', on: true },
            ].map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.k}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{opt.desc}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: 2, width: 36, height: 20, borderRadius: 10, background: opt.on ? 'var(--accent)' : 'var(--surface-2)', justifyContent: opt.on ? 'flex-end' : 'flex-start', cursor: 'pointer' }}>
                  <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                </span>
              </div>
            ))}
          </div>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          <Button variant="primary" icon={<Ico.QR size={14}/>}>Generate &amp; download</Button>
        </ModalFooter>
      </ModalShell>
    </Shell>
  );
};

Object.assign(window, { QRManagementScreen, PLATFORM_QR_CODES });
