/* global React */
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ============================================================
   Icons (stroke 1.5, 20×20 viewBox 24)
   ============================================================ */
const Icon = ({ name, size = 20, className = "", stroke = 1.6 }) => {
  const paths = {
    qr: <><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h3"/><path d="M14 17v4"/><path d="M17 17h4v4"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l3-4 4 3 6-7"/></>,
    sparkles: <><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></>,
    star: <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />,
    check: <path d="M5 12l5 5L20 7" />,
    arrow: <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    arrowDown: <><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></>,
    arrowUp: <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>,
    funnel: <><path d="M3 5h18l-7 8v6l-4-2v-4z"/></>,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    google: <><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H3v2.7C4.7 19.8 8.1 22 12 22z" fill="#34A853" stroke="none"/><path d="M6.3 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.5H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.3-2.7z" fill="#FBBC05" stroke="none"/><path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.3 2.7C7.1 7.6 9.4 5.8 12 5.8z" fill="#EA4335" stroke="none"/></>,
    shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>,
    bell: <><path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 004 0"/></>,
    cog: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-1.8-.3 1.6 1.6 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.6 1.6 0 00-1-1.5 1.6 1.6 0 00-1.8.3l-.1.1A2 2 0 014.4 17a2 2 0 010-2.8l.1-.1a1.6 1.6 0 00.3-1.8 1.6 1.6 0 00-1.5-1H3a2 2 0 110-4h.1a1.6 1.6 0 001.5-1 1.6 1.6 0 00-.3-1.8l-.1-.1A2 2 0 117 4.4l.1.1a1.6 1.6 0 001.8.3H9a1.6 1.6 0 001-1.5V3a2 2 0 014 0v.1a1.6 1.6 0 001 1.5 1.6 1.6 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.6 1.6 0 00-.3 1.8V9a1.6 1.6 0 001.5 1H21a2 2 0 110 4h-.1a1.6 1.6 0 00-1.5 1z"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/></>,
    users: <><circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6"/><path d="M17 11a4 4 0 100-8"/><path d="M22 21c-.5-3-2.5-5-5-5.5"/></>,
    building: <><path d="M3 21V5l9-3 9 3v16"/><path d="M3 21h18"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    phone: <path d="M5 4h3l2 5-3 2a12 12 0 006 6l2-3 5 2v3a2 2 0 01-2 2A18 18 0 013 6a2 2 0 012-2z"/>,
    play: <path d="M7 4l13 8-13 8z" />,
    pause: <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    x: <><path d="M6 6l12 12"/><path d="M18 6l-12 12"/></>,
    chevron: <path d="M9 6l6 6-6 6" />,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    download: <><path d="M12 3v12"/><path d="M5 11l7 7 7-7"/><path d="M3 21h18"/></>,
    link: <><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></>,
    scan: <><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><path d="M3 12h18"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a14 14 0 010 20 14 14 0 010-20"/></>,
    palette: <><path d="M12 3a9 9 0 100 18c1 0 2-1 2-2s-1-1-1-2 1-2 2-2h2a4 4 0 004-4c0-4-4-8-9-8z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="12" cy="7.5" r="1.5"/><circle cx="16.5" cy="10.5" r="1.5"/></>,
    moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    rocket: <><path d="M4.5 16.5c-1 .5-2 4-2 4s3.5-.5 4-2c.3-1-.4-2.3-2-2zM12 15l-3-3a14 14 0 016-7l3 1 1 3a14 14 0 01-7 6z"/><circle cx="13" cy="9" r="1.5"/></>,
    creditCard: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    heart: <path d="M12 21s-7-4.4-9.5-9C1 9 3 5 7 5c2 0 4 1 5 3 1-2 3-3 5-3 4 0 6 4 4.5 7-2.5 4.6-9.5 9-9.5 9z"/>,
    twitter: <path d="M21 5.9a8 8 0 01-2.3.6 4 4 0 001.7-2.2 8 8 0 01-2.6 1A4 4 0 0011 8.5c0 .3 0 .6.1.9a11 11 0 01-8-4 4 4 0 001.2 5.3 4 4 0 01-1.8-.5v.1a4 4 0 003.2 4 4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 013 18.6 11 11 0 009 20c7.2 0 11-6 11-11v-.5A8 8 0 0021 6z" />,
    github: <path d="M12 2a10 10 0 00-3 19c.5 0 .7-.3.7-.6v-2c-3 .6-3.6-1.3-3.6-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1 .1 1.6 1 1.6 1 1 1.7 2.6 1.2 3.2 1 .1-.8.4-1.3.7-1.6-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1-3-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1a10 10 0 015 0c2-1.3 2.9-1 2.9-1 .6 1.4.2 2.5.1 2.8.6.8 1 1.8 1 3 0 4.2-2.6 5.1-5 5.4.4.4.7 1 .7 2.1v3.1c0 .3.2.6.7.6A10 10 0 0012 2z" />,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 17v-7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {paths[name] || null}
    </svg>
  );
};

/* ============================================================
   QRPattern — deterministic pseudo-QR (decorative)
   ============================================================ */
const QRPattern = ({ size = 160, label = "" }) => {
  const cells = 25;
  const cellSize = size / cells;
  // Stable pseudo-random pattern
  const grid = useMemo(() => {
    const seed = (label || "REEVO").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const arr = [];
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const n = Math.sin((x * 53 + y * 91 + seed * 13) * 0.4321) * 10000;
        arr.push(((n - Math.floor(n)) > 0.5) ? 1 : 0);
      }
    }
    // finder patterns
    const setBlock = (sx, sy) => {
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const onBorder = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        arr[(sy + y) * cells + (sx + x)] = (onBorder || inner) ? 1 : 0;
      }
    };
    setBlock(0, 0); setBlock(cells - 7, 0); setBlock(0, cells - 7);
    return arr;
  }, [label]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" rx="8"/>
      {grid.map((v, i) => {
        if (!v) return null;
        const x = (i % cells) * cellSize;
        const y = Math.floor(i / cells) * cellSize;
        return <rect key={i} x={x} y={y} width={cellSize * 1.05} height={cellSize * 1.05} fill="#0A0A14" rx={cellSize * 0.15} />;
      })}
      {/* center logo */}
      <rect x={size/2 - 14} y={size/2 - 14} width={28} height={28} fill="white" rx="6" />
      <rect x={size/2 - 9} y={size/2 - 9} width={18} height={18} rx="5" fill="url(#qrgrad)" />
      <defs>
        <linearGradient id="qrgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ============================================================
   Avatar — letter + gradient
   ============================================================ */
const Avatar = ({ name = "?", size = 36, src = null }) => {
  const letters = name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const hue = (name.charCodeAt(0) * 37) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${(hue + 40) % 360} 75% 50%))`,
      color: "white", display: "grid", placeItems: "center",
      fontSize: size * 0.36, fontWeight: 600, letterSpacing: "-0.02em",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)"
    }}>{letters}</div>
  );
};

/* ============================================================
   Stars
   ============================================================ */
const Stars = ({ value = 5, size = 16 }) => (
  <div className="stars" aria-label={`${value} stars`}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= value ? "#F5A623" : "transparent"} stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
      </svg>
    ))}
  </div>
);

/* ============================================================
   AnimatedNumber — counts up on mount
   ============================================================ */
const AnimatedNumber = ({ value, duration = 1100, format = (v) => v.toLocaleString(), suffix = "", prefix = "" }) => {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        started = true;
        const start = performance.now();
        const animate = (t) => {
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setV(value * eased);
          if (p < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return <span ref={ref}>{prefix}{format(Math.round(v))}{suffix}</span>;
};

/* ============================================================
   Sparkline + Line + Area chart
   ============================================================ */
const Sparkline = ({ data, w = 120, h = 32, color = "var(--accent)" }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const xs = (i) => (i / (data.length - 1)) * w;
  const ys = (v) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const AreaChart = ({ data, w = 600, h = 240, color = "var(--accent)", color2 = "var(--accent-2)", showGrid = true, animate = true }) => {
  const padding = { l: 36, r: 16, t: 16, b: 28 };
  const innerW = w - padding.l - padding.r;
  const innerH = h - padding.t - padding.b;
  const max = Math.max(...data.map(d => d.v));
  const min = 0;
  const xs = (i) => padding.l + (i / (data.length - 1)) * innerW;
  const ys = (v) => padding.t + innerH - ((v - min) / (max - min || 1)) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(d.v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${xs(data.length - 1)},${h - padding.b} L ${xs(0)},${h - padding.b} Z`;
  const id = useMemo(() => "g" + Math.random().toString(36).slice(2, 8), []);
  const ticks = 4;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", maxWidth: "100%" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id + "l"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color2} />
        </linearGradient>
      </defs>
      {showGrid && Array.from({ length: ticks + 1 }).map((_, i) => {
        const y = padding.t + (i / ticks) * innerH;
        const val = Math.round(max - (i / ticks) * (max - min));
        return (
          <g key={i}>
            <line x1={padding.l} y1={y} x2={w - padding.r} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === ticks ? "" : "2 4"} />
            <text x={padding.l - 8} y={y + 3} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{val}</text>
          </g>
        );
      })}
      {data.map((d, i) => i % Math.ceil(data.length / 6) === 0 && (
        <text key={i} x={xs(i)} y={h - 8} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{d.x}</text>
      ))}
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke={`url(#${id}l)`} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        {animate && <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="1.4s" fill="freeze" />}
      </path>
      {data.map((d, i) => i === data.length - 1 && (
        <circle key={i} cx={xs(i)} cy={ys(d.v)} r="4" fill={color} stroke="var(--bg)" strokeWidth="2" />
      ))}
    </svg>
  );
};

const BarChart = ({ data, w = 600, h = 200, color = "var(--accent)" }) => {
  const padding = { l: 28, r: 12, t: 12, b: 28 };
  const innerW = w - padding.l - padding.r;
  const innerH = h - padding.t - padding.b;
  const max = Math.max(...data.map(d => d.v));
  const barW = innerW / data.length * 0.6;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="barg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.95" />
          <stop offset="1" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const x = padding.l + (i / data.length) * innerW + (innerW / data.length - barW) / 2;
        const bh = (d.v / max) * innerH;
        const y = padding.t + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx="3" fill="url(#barg)">
              <animate attributeName="height" from="0" to={bh} dur="0.7s" fill="freeze" />
              <animate attributeName="y" from={padding.t + innerH} to={y} dur="0.7s" fill="freeze" />
            </rect>
            <text x={x + barW / 2} y={h - 10} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{d.x}</text>
          </g>
        );
      })}
    </svg>
  );
};

const Donut = ({ data, size = 160, thickness = 22 }) => {
  const total = data.reduce((a, d) => a + d.v, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-2)" strokeWidth={thickness} fill="none" />
      {data.map((d, i) => {
        const len = (d.v / total) * c;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r}
            stroke={d.color} strokeWidth={thickness} fill="none"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            strokeLinecap="butt"
          />
        );
        offset += len;
        return el;
      })}
      <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--ink)" letterSpacing="-0.02em">{total.toLocaleString()}</text>
      <text x={size/2} y={size/2 + 16} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)" letterSpacing="0.05em">TOTAL</text>
    </svg>
  );
};

/* ============================================================
   Funnel chart (horizontal bars)
   ============================================================ */
const FunnelChart = ({ steps }) => {
  const max = steps[0].v;
  return (
    <div className="col" style={{ gap: 10 }}>
      {steps.map((s, i) => {
        const pct = (s.v / max) * 100;
        return (
          <div key={i}>
            <div className="between" style={{ marginBottom: 4, fontSize: 13, gap: 12 }}>
              <span style={{ color: "var(--ink-2)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{s.label}</span>
              <span className="mono" style={{ color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0 }}>{s.v.toLocaleString()} · {((s.v/max)*100).toFixed(0)}%</span>
            </div>
            <div style={{ height: 28, background: "var(--surface-2)", borderRadius: 8, overflow: "hidden", position: "relative" }}>
              <div style={{
                width: `${pct}%`,
                height: "100%",
                background: `linear-gradient(90deg, color-mix(in oklab, var(--accent) ${100 - i * 12}%, var(--accent-2)), var(--accent-2))`,
                borderRadius: 8,
                transition: "width .8s ease",
                position: "relative",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 60%)" }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   Expose
   ============================================================ */
Object.assign(window, {
  Icon, QRPattern, Avatar, Stars,
  AnimatedNumber, Sparkline, AreaChart, BarChart, Donut, FunnelChart,
});
