"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── data ─────────────────────────────────────────────────── */
const INDUSTRY_DATA = [
  {
    id: "restaurants", name: "Restaurants", icon: "🍽️", color: "#F4A861", tag: "Most popular",
    pitch: "Replace 'how was everything?' with a QR on the receipt. Catch happy diners while they're still tasting dessert.",
    stats: [{ k: "Avg review lift", v: "+340%" }, { k: "5★ rate", v: "94%" }, { k: "Avg setup", v: "4 min" }],
    bullets: ["Receipt-printer integrations", "Table-tent QR kits", "Post-meal SMS funnel", "Multi-location dashboards"],
    series: [12, 14, 18, 20, 24, 28, 32, 36, 42, 48],
  },
  {
    id: "salons", name: "Salons & Beauty", icon: "💇", color: "#E48BD3", tag: undefined,
    pitch: "Customers walk out feeling great. QR at the chair captures the moment before life happens.",
    stats: [{ k: "Avg review lift", v: "+280%" }, { k: "5★ rate", v: "96%" }, { k: "Avg setup", v: "3 min" }],
    bullets: ["Chair-side mirror QR cards", "Stylist attribution", "Booking-system integrations", "Service-specific tone"],
    series: [8, 10, 12, 16, 20, 24, 28, 32, 38, 44],
  },
  {
    id: "clinics", name: "Clinics & Healthcare", icon: "🩺", color: "#67C3F2", tag: undefined,
    pitch: "Reviews build trust. Reception QR + post-visit SMS turns satisfied patients into your best marketing.",
    stats: [{ k: "Avg review lift", v: "+410%" }, { k: "5★ rate", v: "93%" }, { k: "HIPAA mode", v: "Yes" }],
    bullets: ["HIPAA-safe data handling", "Reception sticker QRs", "After-care SMS automation", "Per-provider tracking"],
    series: [6, 8, 12, 18, 22, 28, 34, 38, 42, 48],
  },
  {
    id: "drycleaners", name: "Dry Cleaners", icon: "👔", color: "#9C8FF1", tag: undefined,
    pitch: "QR on the garment tag. Customer scans at pickup — the bag isn't even open yet.",
    stats: [{ k: "Avg review lift", v: "+220%" }, { k: "5★ rate", v: "91%" }, { k: "Avg setup", v: "2 min" }],
    bullets: ["Garment-tag QR labels", "Pickup-time prompts", "Per-route campaigns", "Customer loyalty tracking"],
    series: [4, 6, 8, 10, 14, 18, 22, 24, 28, 32],
  },
  {
    id: "gyms", name: "Gyms & Fitness", icon: "🏋️", color: "#7CD8A9", tag: undefined,
    pitch: "After class endorphins are the perfect time. Locker QR or trainer-led prompt — they're already on their phone.",
    stats: [{ k: "Avg review lift", v: "+260%" }, { k: "5★ rate", v: "92%" }, { k: "Avg setup", v: "3 min" }],
    bullets: ["Locker QR stickers", "Trainer attribution", "Class-end prompts", "Member-only funnels"],
    series: [10, 12, 14, 18, 22, 26, 30, 34, 38, 42],
  },
  {
    id: "retail", name: "Retail Stores", icon: "🛍️", color: "#F58592", tag: undefined,
    pitch: "QR at the counter + bag inserts. Catch the post-purchase glow.",
    stats: [{ k: "Avg review lift", v: "+190%" }, { k: "5★ rate", v: "90%" }, { k: "Avg setup", v: "5 min" }],
    bullets: ["POS-receipt printing", "Bag-insert QR cards", "Per-store campaigns", "POS integrations"],
    series: [14, 16, 18, 20, 22, 26, 28, 30, 34, 38],
  },
  {
    id: "cafes", name: "Cafés", icon: "☕", color: "#C49A6C", tag: undefined,
    pitch: "Cup sleeves, receipt QRs, table tents — the café's natural review surfaces, made smart.",
    stats: [{ k: "Avg review lift", v: "+310%" }, { k: "5★ rate", v: "95%" }, { k: "Avg setup", v: "3 min" }],
    bullets: ["Cup-sleeve QR design", "Receipt printer integration", "Time-of-day campaigns", "Brand voice training"],
    series: [10, 14, 18, 22, 28, 32, 36, 42, 48, 52],
  },
  {
    id: "services", name: "Service Providers", icon: "🛠️", color: "#9FBE8C", tag: undefined,
    pitch: "Plumbers, electricians, cleaners — QR on the invoice or 'job done' text turns great work into a Google review.",
    stats: [{ k: "Avg review lift", v: "+240%" }, { k: "5★ rate", v: "94%" }, { k: "Avg setup", v: "4 min" }],
    bullets: ["Invoice QR printing", "SMS funnel automation", "Per-technician attribution", "Field-team app"],
    series: [6, 8, 12, 14, 16, 20, 22, 26, 30, 34],
  },
];

type Industry = typeof INDUSTRY_DATA[number];

/* ─── mini chart components ─────────────────────────────────── */
function Sparkline({ data, w = 46, h = 18, color }: { data: number[]; w?: number; h?: number; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const xs = (i: number) => (i / (data.length - 1)) * w;
  const ys = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 2) - 1;
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaChart({ data, color, w = 500, h = 160 }: { data: { x: string; v: number }[]; color: string; w?: number; h?: number }) {
  const pad = { l: 8, r: 8, t: 12, b: 8 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.max(...data.map((d) => d.v)) || 1;
  const xs = (i: number) => pad.l + (i / (data.length - 1)) * iw;
  const ys = (v: number) => pad.t + ih - (v / max) * ih;
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(d.v).toFixed(1)}`).join(" ");
  const area = `${line} L${xs(data.length - 1)},${h - pad.b} L${xs(0)},${h - pad.b} Z`;
  const id = `ag-${color.replace("#", "")}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs(data.length - 1)} cy={ys(data[data.length - 1].v)} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

/* ─── QR pattern ────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function QRMini({ color }: { color: string }) {
  return (
    <div style={{ width: 80, height: 80, padding: 8, background: "white", borderRadius: 10, border: "1px solid var(--border)" }}>
      <svg width="100%" height="100%" viewBox="0 0 64 64">
        {[0,1,2,3,4,5,6].map((r) =>
          [0,1,2,3,4,5,6].map((c) => {
            const isCorner = (r < 3 && c < 3) || (r < 3 && c > 3) || (r > 3 && c < 3);
            const rand = ((r * 7 + c) * 17 + r * 3) % 5;
            const fill = isCorner || rand < 3;
            return fill ? (
              <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width="7" height="7" rx="1.2" fill={isCorner ? color : "#333"} opacity={isCorner ? 1 : 0.85} />
            ) : null;
          })
        )}
      </svg>
    </div>
  );
}

/* ─── mobile funnel preview ─────────────────────────────────── */
function MobileFunnelPreview({ industry }: { industry: Industry }) {
  return (
    <div style={{ width: 260, background: "#0B0B14", borderRadius: 36, padding: 10, boxShadow: "0 32px 80px -24px rgba(40,30,120,0.45), 0 16px 40px -16px rgba(15,15,30,0.2), inset 0 0 0 1px rgba(255,255,255,0.05)", position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 70, height: 20, background: "#0B0B14", borderRadius: 999, zIndex: 5 }} />
      <div style={{ background: "#FFFFFF", borderRadius: 28, overflow: "hidden", position: "relative", aspectRatio: "9/19.5", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 34, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 20px 4px", fontSize: 11, fontWeight: 600, color: "#111" }}>
          <span>9:41</span>
        </div>
        <div style={{ flex: 1, padding: "8px 16px 16px", display: "flex", flexDirection: "column", color: "#111", overflowY: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg, ${industry.color}, var(--accent-2))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{industry.icon}</div>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{industry.name.split("&")[0].trim()}</span>
            </div>
            <span style={{ fontSize: 10, color: "#9aa", fontFamily: "monospace" }}>via reevo</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", gap: 14 }}>
            <div>
              <h3 style={{ fontSize: 17, margin: 0, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.2 }}>How was your visit?</h3>
              <p style={{ fontSize: 11, color: "#777", margin: "6px 0 0" }}>Tap a star to continue</p>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <svg key={i} width={28} height={28} viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                  <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                </svg>
              ))}
            </div>
            <div style={{ padding: "10px 12px", background: "linear-gradient(135deg, #f0eeff, #e8f4ff)", borderRadius: 10, border: "1px solid #ddd", textAlign: "left" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--accent-ink)", marginBottom: 3 }}>✨ AI suggestion</div>
              <div style={{ fontSize: 11, color: "#333", lineHeight: 1.5 }}>Absolutely loved my experience! The team was wonderful and everything exceeded my expectations…</div>
            </div>
            <div style={{ padding: "9px 14px", background: "#111", borderRadius: 9, color: "white", fontSize: 12, fontWeight: 600, textAlign: "center", cursor: "pointer" }}>
              Copy &amp; post on Google ↗
            </div>
          </div>

          <div style={{ height: 12, display: "flex", justifyContent: "center", alignItems: "center", marginTop: 8 }}>
            <div style={{ width: 90, height: 4, background: "#111", borderRadius: 999, opacity: 0.85 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────── */
export default function IndustriesContent() {
  const [active, setActive] = useState("restaurants");
  const cur = INDUSTRY_DATA.find((i) => i.id === active)!;

  const scrollToDetail = (id: string) => {
    setActive(id);
    if (typeof window !== "undefined") {
      const el = document.getElementById("industry-detail");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* ── pill selector ── */}
      <section style={{ padding: "0 0 40px" }}>
        <div className="container">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {INDUSTRY_DATA.map((ind) => (
              <button
                key={ind.id}
                onClick={() => scrollToDetail(ind.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 999, cursor: "pointer",
                  background: active === ind.id ? "var(--ink)" : "var(--surface)",
                  color: active === ind.id ? "var(--bg)" : "var(--ink-2)",
                  border: `1px solid ${active === ind.id ? "var(--ink)" : "var(--border)"}`,
                  fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 16 }}>{ind.icon}</span>
                {ind.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── detail card ── */}
      <section id="industry-detail" className="section" style={{ paddingTop: 0, scrollMarginTop: 80 }}>
        <div className="container">
          <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-lg)", borderRadius: 24 }}>
            {/* top half */}
            <div
              style={{
                padding: "40px 48px",
                display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center",
                background: `linear-gradient(135deg, color-mix(in oklab, ${cur.color} 12%, var(--surface)), var(--surface) 80%)`,
                position: "relative", overflow: "hidden",
              }}
              className="ind-detail-grid"
            >
              <div style={{ position: "relative", zIndex: 1 }}>
                {/* header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, fontSize: 28,
                    background: `linear-gradient(135deg, color-mix(in oklab, ${cur.color} 22%, white), color-mix(in oklab, ${cur.color} 8%, white))`,
                    display: "grid", placeItems: "center",
                  }}>
                    {cur.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: cur.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {cur.tag ? cur.tag : "Industry"}
                    </div>
                    <h3 style={{ margin: 0, fontSize: 26, letterSpacing: "-0.02em", color: "var(--ink)" }}>{cur.name}</h3>
                  </div>
                </div>

                <p className="lead" style={{ fontSize: 17, marginTop: 12 }}>{cur.pitch}</p>

                {/* stats */}
                <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                  {cur.stats.map((s) => (
                    <div key={s.k} style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.k}</div>
                      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)", marginTop: 2 }}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {/* bullets */}
                <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {cur.bullets.map((b) => (
                    <li key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink-2)" }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 999, flexShrink: 0,
                        background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                        color: "var(--accent)", display: "grid", placeItems: "center",
                      }}>
                        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* CTAs */}
                <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
                  <Link href="/signup" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    Start with this template
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link href="/contact" className="btn btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                    Book a demo
                  </Link>
                </div>
              </div>

              {/* mobile preview */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <MobileFunnelPreview industry={cur} />
              </div>
            </div>

            {/* bottom half — chart + template list */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--border)" }} className="ind-detail-stats">
              <div style={{ padding: 28, borderRight: "1px solid var(--border)" }}>
                <div className="kicker">REVIEW VELOCITY</div>
                <h4 style={{ margin: "4px 0 20px", fontSize: 17, color: "var(--ink)" }}>Reviews per day in this category</h4>
                <AreaChart data={cur.series.map((v, i) => ({ x: `D${i + 1}`, v }))} color={cur.color} />
              </div>
              <div style={{ padding: 28 }}>
                <div className="kicker">FUNNEL TEMPLATE</div>
                <h4 style={{ margin: "4px 0 16px", fontSize: 17, color: "var(--ink)" }}>Recommended placement</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cur.bullets.map((b, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", width: 24, flexShrink: 0 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .ind-detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 28px 24px !important; }
            .ind-detail-grid > div:last-child { display: none !important; }
            .ind-detail-stats { grid-template-columns: 1fr !important; }
            .ind-detail-stats > div { border-right: none !important; border-bottom: 1px solid var(--border); }
          }
        `}</style>
      </section>

      {/* ── all industries grid ── */}
      <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
            <span className="eyebrow"><span className="dot" /> All industries</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Browse all categories.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="ind-grid">
            {INDUSTRY_DATA.map((ind) => (
              <button
                key={ind.id}
                onClick={() => scrollToDetail(ind.id)}
                className="card lift"
                style={{
                  padding: 22, cursor: "pointer", textAlign: "left",
                  background: active === ind.id ? `color-mix(in oklab, ${ind.color} 6%, var(--surface))` : "var(--surface)",
                  border: `1px solid ${active === ind.id ? ind.color + "60" : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, fontSize: 20,
                    background: `linear-gradient(135deg, color-mix(in oklab, ${ind.color} 22%, white), color-mix(in oklab, ${ind.color} 8%, white))`,
                    display: "grid", placeItems: "center",
                  }}>
                    {ind.icon}
                  </div>
                  <Sparkline data={ind.series} color={ind.color} />
                </div>
                <h4 style={{ margin: "0 0 10px", fontSize: 15, color: "var(--ink)" }}>{ind.name}</h4>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999,
                  fontSize: 11, fontWeight: 500, color: "#117047", background: "#E4F7EE", border: "1px solid #BFE9D2",
                }}>
                  {ind.stats[0].v} reviews
                </span>
              </button>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) { .ind-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px) { .ind-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </>
  );
}
