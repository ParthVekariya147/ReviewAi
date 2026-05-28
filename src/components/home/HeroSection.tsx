"use client";

import Link from "next/link";
import { useState } from "react";

const BrandMark = ({ size = 22 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.3, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center" }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const Sparkline = ({ data, w = 120, h = 28, color = "var(--accent)" }: { data: number[], w?: number, h?: number, color?: string }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const xs = (i: number) => (i / (data.length - 1)) * w;
  const ys = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const AreaChart = ({ data }: { data: { x: string, v: number }[] }) => {
  const w = 720, h = 200, padding = { l: 36, r: 16, t: 16, b: 28 };
  const innerW = w - padding.l - padding.r;
  const innerH = h - padding.t - padding.b;
  const max = Math.max(...data.map(d => d.v));
  const xs = (i: number) => padding.l + (i / (data.length - 1)) * innerW;
  const ys = (v: number) => padding.t + innerH - (v / (max || 1)) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(d.v).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${xs(data.length - 1)},${h - padding.b} L ${xs(0)},${h - padding.b} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", maxWidth: "100%" }}>
      <defs>
        <linearGradient id="hg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = padding.t + (i / 4) * innerH;
        return <line key={i} x1={padding.l} y1={y} x2={w - padding.r} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray={i === 4 ? "" : "2 4"} />;
      })}
      <path d={areaPath} fill="url(#hg1)" />
      <path d={linePath} fill="none" stroke="url(#hg2)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <animate attributeName="stroke-dasharray" from="0,1000" to="1000,0" dur="1.4s" fill="freeze" />
      </path>
      <circle cx={xs(data.length - 1)} cy={ys(data[data.length - 1].v)} r="4" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
    </svg>
  );
};

const genSeries = (n: number, base: number, vary: number, trend = 0) => {
  const out: { x: string, v: number }[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (Math.sin(i * 0.7) * vary) + 0.1 * vary + trend;
    out.push({ x: `D${i + 1}`, v: Math.max(0, Math.round(v)) });
  }
  return out;
};

const FunnelBar = ({ label, pct, idx }: { label: string, pct: number, idx: number }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, gap: 8 }}>
      <span style={{ color: "var(--ink-2)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{label}</span>
      <span style={{ color: "var(--muted)", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{pct}%</span>
    </div>
    <div style={{ height: 24, background: "var(--surface-2)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, color-mix(in oklab, var(--accent) ${100 - idx * 12}%, var(--accent-2)), var(--accent-2))`, borderRadius: 6 }} />
    </div>
  </div>
);

function DashboardPreview() {
  const [tab, setTab] = useState("scans");
  const data = {
    scans: genSeries(14, 220, 60, 12),
    conversions: genSeries(14, 80, 30, 6),
    reviews: genSeries(14, 32, 14, 4),
  }[tab] ?? genSeries(14, 220, 60, 12);

  return (
    <div className="card lift" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-xl)", borderRadius: 18, background: "var(--surface)" }}>
      {/* Browser chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FF5F57" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FEBC2E" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28C840" }} />
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          app.reevo.io / campaigns / autumn-2026
        </div>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, hsl(200 70% 60%), hsl(240 75% 50%))", display: "grid", placeItems: "center", fontSize: 9, fontWeight: 600, color: "white" }}>L</div>
      </div>

      {/* Dashboard body */}
      <div className="hero-db-inner" style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 460 }}>
        {/* Sidebar */}
        <div style={{ borderRight: "1px solid var(--border)", padding: 14, background: "var(--bg-soft)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="row" style={{ gap: 8, padding: "6px 8px", marginBottom: 8 }}>
            <BrandMark size={22} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Reevo</span>
          </div>
          {[
            ["chart", "Overview", true],
            ["funnel", "Campaigns"],
            ["qr", "QR codes"],
            ["star", "Reviews"],
            ["users", "Customers"],
            ["target", "Conversion"],
          ].map(([icon, label, active]) => (
            <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: active ? "var(--surface)" : "transparent", border: active ? "1px solid var(--border)" : "1px solid transparent", boxShadow: active ? "var(--shadow-xs)" : "none", fontSize: 13, color: active ? "var(--ink)" : "var(--muted)", fontWeight: active ? 500 : 400 }}>
              <SidebarIcon name={String(icon)} />
              <span>{String(label)}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ padding: 12, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 12%, transparent), color-mix(in oklab, var(--accent-2) 12%, transparent))", borderRadius: 10, border: "1px solid color-mix(in oklab, var(--accent) 20%, transparent)" }}>
            <div style={{ fontSize: 11, color: "var(--accent-ink)", fontWeight: 600, marginBottom: 4 }}>Trial ends in 7 days</div>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>Upgrade to keep unlimited QR funnels.</div>
          </div>
        </div>

        {/* Main panel */}
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="between">
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>OVERVIEW · LAST 14 DAYS</div>
              <h3 style={{ margin: "4px 0 0", fontSize: 18, letterSpacing: "-0.01em" }}>Autumn 2026 campaign</h3>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="chip green" style={{ fontSize: 11 }}>+24.6%</span>
              <span className="chip" style={{ fontSize: 11 }}>Export</span>
            </div>
          </div>

          {/* KPI tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "QR scans", value: "8,421", delta: "+18.2%", series: [12,18,22,28,24,32,40,38,42,48,52,58,62,68] },
              { label: "Funnel completions", value: "4,126", delta: "+12.4%", series: [10,12,18,22,26,28,30,32,34,38,40,44,46,50] },
              { label: "Google reviews", value: "1,842", delta: "+34.1%", series: [4,6,8,10,12,14,16,20,24,28,30,34,38,42] },
            ].map((k, i) => (
              <div key={i} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{k.label.toUpperCase()}</div>
                <div className="between" style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{k.value}</div>
                  <span style={{ fontSize: 11, color: "#117047", fontWeight: 500 }}>{k.delta}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Sparkline data={k.series} w={160} h={28} color="var(--accent)" />
                </div>
              </div>
            ))}
          </div>

          {/* Main chart */}
          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
            <div className="between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Conversion over time</span>
              <div className="tabs">
                <button className={tab === "scans" ? "on" : ""} onClick={() => setTab("scans")}>Scans</button>
                <button className={tab === "conversions" ? "on" : ""} onClick={() => setTab("conversions")}>Funnel</button>
                <button className={tab === "reviews" ? "on" : ""} onClick={() => setTab("reviews")}>Reviews</button>
              </div>
            </div>
            <AreaChart data={data} />
          </div>

          {/* Funnel breakdown */}
          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
            <div className="between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Funnel breakdown</span>
              <span className="chip accent" style={{ fontSize: 11 }}>49.0% conv. rate</span>
            </div>
            <div className="col" style={{ gap: 8 }}>
              <FunnelBar label="QR scans" pct={100} idx={0} />
              <FunnelBar label="Rating selected" pct={75} idx={1} />
              <FunnelBar label="AI review copied" pct={58} idx={2} />
              <FunnelBar label="Posted on Google" pct={22} idx={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SidebarIcon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    chart: <><path d="M3 3v18h18"/><path d="M7 14l3-4 4 3 6-7"/></>,
    funnel: <path d="M3 5h18l-7 8v6l-4-2v-4z"/>,
    qr: <><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h3"/><path d="M14 17v4"/><path d="M17 17h4v4"/></>,
    star: <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />,
    users: <><circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6"/><path d="M17 11a4 4 0 100-8"/><path d="M22 21c-.5-3-2.5-5-5-5.5"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  };
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

export default function HeroSection() {
  return (
    <section className="section" style={{ paddingTop: 80, paddingBottom: 100, position: "relative", overflow: "hidden" }}>
      <div className="bg-gradients" />
      <div className="grid-bg" />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Copy */}
        <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
          <div className="row" style={{ justifyContent: "center", marginBottom: 24 }}>
            <span className="eyebrow"><span className="dot" />New · AI-powered review suggestions</span>
          </div>
          <h1 className="h1">
            Turn customer visits into <em>authentic Google reviews.</em>
          </h1>
          <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
            Reevo is the AI-powered QR funnel that helps local businesses convert real, happy customers into 5-star Google reviews — in under a minute, from any phone.
          </p>
          <div className="row hero-cta-row" style={{ justifyContent: "center", gap: 12, marginTop: 32 }}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start free trial
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
            </Link>
            <button className="btn btn-ghost btn-lg">
              <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 4l13 8-13 8z" /></svg>
              Watch 2-min demo
            </button>
          </div>
          <div className="row" style={{ justifyContent: "center", gap: 24, marginTop: 24, fontSize: 13, color: "var(--muted)" }}>
            {["No credit card", "Setup in 3 minutes", "Google compliant"].map((t) => (
              <span key={t} className="row" style={{ gap: 6 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard + Phone composition */}
        <div style={{ position: "relative", marginTop: 80, maxWidth: 1180, marginLeft: "auto", marginRight: "auto" }}>
          <DashboardPreview />

          {/* Floating phone */}
          <div className="hero-phone" style={{ position: "absolute", right: -10, bottom: -80, transform: "rotate(2deg)" }}>
            <MobileFunnelMini />
          </div>

          {/* Floating stat cards */}
          <div className="hero-floater floater" style={{ left: -32, top: 80 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><path d="M3 12h18"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>SCANS · TODAY</div>
              <div className="row" style={{ gap: 6, alignItems: "baseline" }}>
                <strong style={{ fontSize: 18, letterSpacing: "-0.02em" }}>1,284</strong>
                <span style={{ color: "#117047", fontSize: 11 }}>+18%</span>
              </div>
            </div>
          </div>

          <div className="hero-floater floater" style={{ left: 80, bottom: 60 }}>
            <div className="stars">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                  <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                </svg>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>New review posted</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Priya N. · 2s ago</div>
            </div>
            <span className="chip green" style={{ fontSize: 10 }}>5★</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) { .hero-phone { display: none !important; } }
      `}</style>
    </section>
  );
}

function MobileFunnelMini() {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div style={{ height: 38, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 22px 4px", fontSize: 12, fontWeight: 600, color: "#111" }}>
          <span>9:41</span>
        </div>
        <div style={{ flex: 1, padding: "8px 18px 18px", display: "flex", flexDirection: "column", color: "#111" }}>
          <div className="between" style={{ marginBottom: 16 }}>
            <div className="row" style={{ gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Maison Café</span>
            </div>
            <span style={{ fontSize: 11, color: "#9aa", fontFamily: "var(--font-mono)" }}>via reevo</span>
          </div>
          <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", gap: 18 }}>
            <div>
              <h3 style={{ fontSize: 20, margin: 0, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.2 }}>How was your visit?</h3>
              <p style={{ fontSize: 13, color: "#777", margin: "8px 0 0" }}>Tap a star to continue</p>
            </div>
            <div className="row" style={{ justifyContent: "center", gap: 4 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width={34} height={34} viewBox="0 0 24 24" fill={i <= 5 ? "#F5A623" : "transparent"} stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                  <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                </svg>
              ))}
            </div>
            <div style={{ padding: 12, background: "linear-gradient(135deg, #f0eeff, #e8f4ff)", borderRadius: 12, border: "1px solid #ddd", textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent-ink)", marginBottom: 4 }}>✨ AI suggestion</div>
              <div style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>Absolutely loved my visit! The team was friendly and the croissants were warm…</div>
            </div>
          </div>
          <div style={{ height: 14, display: "flex", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
            <div style={{ width: 100, height: 4, background: "#111", borderRadius: 999, opacity: 0.85 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
