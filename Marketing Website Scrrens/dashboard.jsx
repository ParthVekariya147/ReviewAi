/* global React, Icon, Avatar, AreaChart, BarChart, Donut, FunnelChart, Sparkline, Stars */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
/* =============================================================
   Dashboard preview — the "hero" mockup
   ============================================================= */

const genSeries = (n, base, vary, trend = 0) => {
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (Math.sin(i * 0.7) * vary) + (Math.random() - 0.4) * vary + trend;
    out.push({ x: `D${i + 1}`, v: Math.max(0, Math.round(v)) });
  }
  return out;
};

const SAMPLE = {
  scans: genSeries(14, 220, 60, 12),
  conversions: genSeries(14, 80, 30, 6),
  reviews: genSeries(14, 32, 14, 4),
};

const DashboardPreview = ({ compact = false }) => {
  const [tab, setTab] = useState("scans");
  const data = SAMPLE[tab];

  return (
    <div className="card lift" style={{
      padding: 0, overflow: "hidden",
      boxShadow: "var(--shadow-xl)",
      borderRadius: 18,
      background: "var(--surface)",
    }}>
      {/* window chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
        <div className="row" style={{ gap: 6 }}>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FF5F57" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FEBC2E" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28C840" }} />
        </div>
        <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          app.reevo.io / campaigns / autumn-2026
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Avatar name="Liam Park" size={22} />
        </div>
      </div>

      {/* dashboard body */}
      <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "200px 1fr", minHeight: 460 }}>
        {/* sidebar */}
        {!compact && (
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
              ["bell", "Alerts"],
              ["cog", "Settings"],
            ].map(([icon, label, active]) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
                background: active ? "var(--surface)" : "transparent",
                border: active ? "1px solid var(--border)" : "1px solid transparent",
                boxShadow: active ? "var(--shadow-xs)" : "none",
                fontSize: 13, color: active ? "var(--ink)" : "var(--muted)", fontWeight: active ? 500 : 400,
                cursor: "pointer",
              }}>
                <Icon name={icon} size={15} />
                <span>{label}</span>
              </div>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ padding: 12, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 12%, transparent), color-mix(in oklab, var(--accent-2) 12%, transparent))", borderRadius: 10, border: "1px solid color-mix(in oklab, var(--accent) 20%, transparent)" }}>
              <div style={{ fontSize: 11, color: "var(--accent-ink)", fontWeight: 600, marginBottom: 4 }}>Trial ends in 7 days</div>
              <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>Upgrade to keep unlimited QR funnels.</div>
            </div>
          </div>
        )}

        {/* main */}
        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="between">
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>OVERVIEW · LAST 14 DAYS</div>
              <h3 style={{ margin: "4px 0 0", fontSize: 18, letterSpacing: "-0.01em" }}>Autumn 2026 campaign</h3>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="chip green"><Icon name="arrowUp" size={11} /> +24.6%</span>
              <span className="chip"><Icon name="download" size={11} /> Export</span>
            </div>
          </div>

          {/* KPI tiles */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { label: "QR scans", value: 8421, delta: "+18.2%", series: [12,18,22,28,24,32,40,38,42,48,52,58,62,68] },
              { label: "Funnel completions", value: 4126, delta: "+12.4%", series: [10,12,18,22,26,28,30,32,34,38,40,44,46,50] },
              { label: "Google reviews", value: 1842, delta: "+34.1%", series: [4,6,8,10,12,14,16,20,24,28,30,34,38,42] },
            ].map((k, i) => (
              <div key={i} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{k.label.toUpperCase()}</div>
                <div className="between" style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{k.value.toLocaleString()}</div>
                  <span style={{ fontSize: 11, color: "#117047", fontWeight: 500 }}>{k.delta}</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Sparkline data={k.series} w={160} h={28} color={"var(--accent)"} />
                </div>
              </div>
            ))}
          </div>

          {/* main chart */}
          <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
            <div className="between" style={{ marginBottom: 8 }}>
              <div className="row" style={{ gap: 10 }}>
                <Icon name="chart" size={16} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Conversion over time</span>
              </div>
              <div className="tabs">
                <button className={tab === "scans" ? "on" : ""} onClick={() => setTab("scans")}>Scans</button>
                <button className={tab === "conversions" ? "on" : ""} onClick={() => setTab("conversions")}>Funnel</button>
                <button className={tab === "reviews" ? "on" : ""} onClick={() => setTab("reviews")}>Reviews</button>
              </div>
            </div>
            <AreaChart data={data} w={720} h={200} />
          </div>

          {/* bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
            <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
              <div className="between" style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>Funnel breakdown</span>
                <span className="chip accent" style={{ fontSize: 11 }}>49.0% conv. rate</span>
              </div>
              <FunnelChart steps={[
                { label: "QR scans", v: 8421 },
                { label: "Rating selected", v: 6308 },
                { label: "AI review copied", v: 4912 },
                { label: "Posted on Google", v: 1842 },
              ]} />
            </div>
            <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 12, background: "var(--surface)" }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>By device</span>
              <div className="row" style={{ marginTop: 8, gap: 16 }}>
                <Donut size={130} data={[
                  { v: 68, color: "var(--accent)" },
                  { v: 22, color: "var(--accent-2)" },
                  { v: 10, color: "#C9C5F4" },
                ]}/>
                <div className="col" style={{ gap: 8, flex: 1 }}>
                  {[
                    { label: "iOS", v: "68%", color: "var(--accent)" },
                    { label: "Android", v: "22%", color: "var(--accent-2)" },
                    { label: "Desktop", v: "10%", color: "#C9C5F4" },
                  ].map(d => (
                    <div key={d.label} className="between">
                      <div className="row" style={{ gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: 12 }}>{d.label}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{d.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =============================================================
   ReviewsFeed — list of incoming Google reviews
   ============================================================= */

const ReviewItem = ({ name, time, body, rating = 5, business }) => (
  <div className="row" style={{ alignItems: "flex-start", gap: 14, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
    <Avatar name={name} size={40} />
    <div style={{ flex: 1 }}>
      <div className="between" style={{ marginBottom: 4 }}>
        <div className="row" style={{ gap: 8 }}>
          <strong style={{ fontSize: 14 }}>{name}</strong>
          <Stars value={rating} size={12} />
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{time}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{body}</div>
      <div className="row" style={{ marginTop: 8, gap: 6 }}>
        <span className="chip" style={{ fontSize: 11 }}><Icon name="google" size={11} /> Google review</span>
        <span className="chip" style={{ fontSize: 11 }}>{business}</span>
      </div>
    </div>
  </div>
);

const ReviewsFeed = () => (
  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
    <div className="between" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
      <div className="row" style={{ gap: 10 }}>
        <Icon name="star" size={16} />
        <strong style={{ fontSize: 14 }}>Recent reviews</strong>
      </div>
      <span className="chip green">Live</span>
    </div>
    <div style={{ padding: "0 18px" }}>
      <ReviewItem name="Priya N." time="2 min ago" rating={5} business="Maison Café"
        body="Beautiful little spot. Latte art was perfect, the croissants were warm, and the staff went out of their way to recommend things. Will be back this weekend!" />
      <ReviewItem name="Marcus T." time="14 min ago" rating={5} business="Sage Salon"
        body="Booked last minute and they fit me in. Best cut I've had in a year — they actually listened. Highly recommend." />
      <ReviewItem name="Eli R." time="38 min ago" rating={4} business="Vista Dental"
        body="Friendly team, modern facility. Wait was a touch long but the cleaning was thorough and painless." />
    </div>
  </div>
);

Object.assign(window, { DashboardPreview, ReviewsFeed, ReviewItem });
