// charts.jsx — Recharts wrappers that respect light/dark tokens
// All wrappers consume CSS variables via reading computed style on mount.

const R = window.Recharts || {};
const {
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  FunnelChart, Funnel, LabelList,
} = R;

// Read CSS var from <html> root
function cssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// Re-read on theme change. We listen to document data-theme via MutationObserver
function useThemeTokens() {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setTick(t => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => obs.disconnect();
  }, []);
  return React.useMemo(() => ({
    ink: cssVar('--ink', '#0A0A14'),
    ink2: cssVar('--ink-2', '#2A2A38'),
    muted: cssVar('--muted', '#6A6A7B'),
    border: cssVar('--border', '#ECECF1'),
    borderStrong: cssVar('--border-strong', '#E1E1EA'),
    surface: cssVar('--surface', '#FFFFFF'),
    surface2: cssVar('--surface-2', '#F4F4F8'),
    accent: cssVar('--accent', '#6E5BFF'),
    accent2: cssVar('--accent-2', '#2F7DFB'),
    success: cssVar('--success', '#16A34A'),
    warning: cssVar('--warning', '#D97706'),
    danger: cssVar('--danger', '#DC2626'),
    info: cssVar('--info', '#2F7DFB'),
    planFree: cssVar('--plan-free-bg', '#ECECF1'),
    planStarter: cssVar('--plan-starter-bg', '#E2EEFF'),
    planPro: cssVar('--plan-pro-bg', '#EDE9FF'),
  }), [tick]);
}

// Custom tooltip
const ChartTip = (props) => {
  const T = useThemeTokens();
  if (!props.active || !props.payload || !props.payload.length) return null;
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.borderStrong}`,
      borderRadius: 8, padding: '8px 10px', fontSize: 12,
      boxShadow: '0 8px 20px -10px rgba(0,0,0,0.25)',
      minWidth: 120,
    }}>
      {props.label && <div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>{props.label}</div>}
      {props.payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.ink2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }}/>
          <span style={{ flex: 1 }}>{p.name}</span>
          <strong style={{ color: T.ink, fontVariantNumeric: 'tabular-nums' }}>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Daily scans line chart (30 days)
// ============================================================
const DailyScansChart = ({ data, height = 220, showReviews = true }) => {
  const T = useThemeTokens();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={T.accent}  stopOpacity={0.35}/>
              <stop offset="100%" stopColor={T.accent2} stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={T.accent2} stopOpacity={0.20}/>
              <stop offset="100%" stopColor={T.accent2} stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="scanLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={T.accent}/>
              <stop offset="100%" stopColor={T.accent2}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} interval={4}/>
          <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={40}/>
          <Tooltip content={<ChartTip/>}/>
          <Area type="monotone" dataKey="scans"   name="Scans"   stroke="url(#scanLine)" strokeWidth={2.2} fill="url(#scanGrad)" />
          {showReviews && (
            <Area type="monotone" dataKey="reviews" name="Reviews" stroke={T.accent2} strokeWidth={1.6} strokeDasharray="4 3" fill="url(#revGrad)"/>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================
// Plan distribution donut
// ============================================================
const PlanDonutChart = ({ data, height = 220 }) => {
  const T = useThemeTokens();
  const colors = {
    free:       T.muted,
    starter:    T.info,
    pro:        T.accent,
    enterprise: T.accent2,
  };
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="88%" startAngle={90} endAngle={-270} paddingAngle={2} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={colors[d.plan]}/>)}
          </Pie>
          <Tooltip content={<ChartTip/>}/>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.ink, letterSpacing: '-0.02em' }}>{total.toLocaleString()}</div>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Businesses</div>
      </div>
    </div>
  );
};

// Donut legend pills
const DonutLegend = ({ data, total }) => {
  const T = useThemeTokens();
  const colors = {
    free:       T.muted,
    starter:    T.info,
    pro:        T.accent,
    enterprise: T.accent2,
  };
  total = total || data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: colors[d.plan] }}/>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)', textTransform: 'capitalize' }}>{d.name}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{d.value.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 38, textAlign: 'right' }}>{Math.round(d.value / total * 100)}%</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Device split donut
// ============================================================
const DeviceDonutChart = ({ data, height = 200 }) => {
  const T = useThemeTokens();
  const colors = [T.accent, T.accent2, T.muted];
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} paddingAngle={2} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={colors[i]}/>)}
          </Pie>
          <Tooltip content={<ChartTip/>}/>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.ink }}>{total.toLocaleString()}</div>
        <div style={{ fontSize: 10, color: T.muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Scans</div>
      </div>
    </div>
  );
};

// ============================================================
// Top businesses / countries bar chart (horizontal)
// ============================================================
const HBarChart = ({ data, height = 280, valueKey = 'scans', labelKey = 'name' }) => {
  const T = useThemeTokens();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="hbarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={T.accent}/>
              <stop offset="100%" stopColor={T.accent2}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false}/>
          <YAxis type="category" dataKey={labelKey} tick={{ fill: T.ink2, fontSize: 12 }} axisLine={false} tickLine={false} width={170}/>
          <Tooltip content={<ChartTip/>} cursor={{ fill: T.surface2 }}/>
          <Bar dataKey={valueKey} fill="url(#hbarGrad)" radius={[0, 4, 4, 0]} barSize={14}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================
// Event funnel (custom - horizontal bars with drop-off %)
// ============================================================
const EventFunnel = ({ data }) => {
  const T = useThemeTokens();
  const max = Math.max(...data.map(d => d.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => {
        const w = (d.count / max) * 100;
        const prev = i > 0 ? data[i - 1] : null;
        const dropoff = prev ? Math.round((1 - d.count / prev.count) * 100) : null;
        return (
          <div key={d.event} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
            <div style={{ width: 96, textTransform: 'capitalize', color: 'var(--ink-2)', fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{d.event}</div>
            <div style={{ flex: 1, position: 'relative', height: 28, background: 'var(--surface-2)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', inset: 0, width: `${w}%`,
                background: 'var(--accent-gradient)',
                borderRadius: 6,
                display: 'flex', alignItems: 'center', paddingLeft: 12,
                color: '#fff', fontWeight: 600, fontSize: 12,
                fontVariantNumeric: 'tabular-nums',
              }}>{d.count.toLocaleString()}</div>
              <div style={{
                position: 'absolute', right: 10, top: 0, bottom: 0,
                display: 'flex', alignItems: 'center',
                color: 'var(--muted)', fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
              }}>{Math.round(d.pct * 100)}%</div>
            </div>
            <div style={{
              width: 56, textAlign: 'right', fontSize: 11,
              color: dropoff === null ? 'transparent' : (dropoff > 50 ? 'var(--danger-ink)' : dropoff > 25 ? 'var(--warning-ink)' : 'var(--muted)'),
              fontWeight: 600,
            }}>{dropoff !== null ? `-${dropoff}%` : '·'}</div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// MRR small chart
// ============================================================
const MRRChart = ({ data, height = 100 }) => {
  const T = useThemeTokens();
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={T.accent} stopOpacity={0.4}/>
              <stop offset="100%" stopColor={T.accent2} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="mrr" stroke={T.accent} strokeWidth={2} fill="url(#mrrGrad)"/>
          <Tooltip content={<ChartTip/>}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ============================================================
// Stacked draft-acceptance bar
// ============================================================
const DraftAcceptance = ({ data }) => {
  const T = useThemeTokens();
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div style={{ display: 'flex', height: 36, borderRadius: 8, overflow: 'hidden', background: 'var(--surface-2)' }}>
        <div style={{ flex: data[0].value, background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
          {Math.round(data[0].value / total * 100)}%
        </div>
        <div style={{ flex: data[1].value, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', fontWeight: 600, fontSize: 12 }}>
          {Math.round(data[1].value / total * 100)}%
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }}/>
            <span style={{ color: 'var(--ink-2)' }}>Draft 1 (first generated)</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{data[0].value.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <span style={{ color: 'var(--ink-2)' }}>Draft 2 (after refresh)</span>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--muted)' }}/>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{data[1].value.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, {
  useThemeTokens, ChartTip,
  DailyScansChart, PlanDonutChart, DonutLegend, DeviceDonutChart,
  HBarChart, EventFunnel, MRRChart, DraftAcceptance,
});
