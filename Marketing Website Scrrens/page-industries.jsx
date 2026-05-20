/* global React, Icon, Sparkline, BarChart, AreaChart, QRPattern, MobileFunnel, CTABanner, INDUSTRIES, Stars */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const INDUSTRY_DATA = [
  { id: "restaurants", name: "Restaurants", icon: "🍽️", color: "#F4A861", tag: "Most popular",
    pitch: "Replace 'how was everything?' with a QR on the receipt. Catch happy diners while they're still tasting dessert.",
    stats: [{ k: "Avg review lift", v: "+340%" }, { k: "5★ rate", v: "94%" }, { k: "Avg setup", v: "4 min" }],
    bullets: ["Receipt-printer integrations", "Table-tent QR kits", "Post-meal SMS funnel", "Multi-location dashboards"],
    series: [12,14,18,20,24,28,32,36,42,48],
  },
  { id: "salons", name: "Salons & Beauty", icon: "💇", color: "#E48BD3",
    pitch: "Customers walk out feeling great. QR at the chair captures the moment before life happens.",
    stats: [{ k: "Avg review lift", v: "+280%" }, { k: "5★ rate", v: "96%" }, { k: "Avg setup", v: "3 min" }],
    bullets: ["Chair-side mirror QR cards", "Stylist attribution", "Booking-system integrations", "Service-specific tone"],
    series: [8,10,12,16,20,24,28,32,38,44],
  },
  { id: "clinics", name: "Clinics & Healthcare", icon: "🩺", color: "#67C3F2",
    pitch: "Reviews build trust. Reception QR + post-visit SMS turns satisfied patients into your best marketing.",
    stats: [{ k: "Avg review lift", v: "+410%" }, { k: "5★ rate", v: "93%" }, { k: "HIPAA mode", v: "Yes" }],
    bullets: ["HIPAA-safe data handling", "Reception sticker QRs", "After-care SMS automation", "Per-provider tracking"],
    series: [6,8,12,18,22,28,34,38,42,48],
  },
  { id: "drycleaners", name: "Dry Cleaners", icon: "👔", color: "#9C8FF1",
    pitch: "QR on the garment tag. Customer scans at pickup — the bag isn't even open yet.",
    stats: [{ k: "Avg review lift", v: "+220%" }, { k: "5★ rate", v: "91%" }, { k: "Avg setup", v: "2 min" }],
    bullets: ["Garment-tag QR labels", "Pickup-time prompts", "Per-route campaigns", "Customer loyalty tracking"],
    series: [4,6,8,10,14,18,22,24,28,32],
  },
  { id: "gyms", name: "Gyms & Fitness", icon: "🏋️", color: "#7CD8A9",
    pitch: "After class endorphins are the perfect time. Locker QR or trainer-led prompt — they're already on their phone.",
    stats: [{ k: "Avg review lift", v: "+260%" }, { k: "5★ rate", v: "92%" }, { k: "Avg setup", v: "3 min" }],
    bullets: ["Locker QR stickers", "Trainer attribution", "Class-end prompts", "Member-only funnels"],
    series: [10,12,14,18,22,26,30,34,38,42],
  },
  { id: "retail", name: "Retail Stores", icon: "🛍️", color: "#F58592",
    pitch: "QR at the counter + bag inserts. Catch the post-purchase glow.",
    stats: [{ k: "Avg review lift", v: "+190%" }, { k: "5★ rate", v: "90%" }, { k: "Avg setup", v: "5 min" }],
    bullets: ["POS-receipt printing", "Bag-insert QR cards", "Per-store campaigns", "POS integrations"],
    series: [14,16,18,20,22,26,28,30,34,38],
  },
  { id: "cafes", name: "Cafés", icon: "☕", color: "#C49A6C",
    pitch: "Cup sleeves, receipt QRs, table tents — the café's natural review surfaces, made smart.",
    stats: [{ k: "Avg review lift", v: "+310%" }, { k: "5★ rate", v: "95%" }, { k: "Avg setup", v: "3 min" }],
    bullets: ["Cup-sleeve QR design", "Receipt printer integration", "Time-of-day campaigns", "Brand voice training"],
    series: [10,14,18,22,28,32,36,42,48,52],
  },
  { id: "services", name: "Service Providers", icon: "🛠️", color: "#9FBE8C",
    pitch: "Plumbers, electricians, cleaners — QR on the invoice or 'job done' text. The work speaks; the QR turns it into a Google review.",
    stats: [{ k: "Avg review lift", v: "+240%" }, { k: "5★ rate", v: "94%" }, { k: "Avg setup", v: "4 min" }],
    bullets: ["Invoice QR printing", "SMS funnel automation", "Per-technician attribution", "Field-team app"],
    series: [6,8,12,14,16,20,22,26,30,34],
  },
];

const IndustriesPage = ({ navigate }) => {
  const [active, setActive] = useState("restaurants");
  const cur = INDUSTRY_DATA.find(i => i.id === active);

  return (
    <div data-screen-label="04 Industries">
      <section className="section" style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}>
        <div className="bg-gradients" />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800 }}>
          <span className="eyebrow"><span className="dot" /> Industries</span>
          <h1 className="h1" style={{ marginTop: 18 }}>Templates tuned to <em>every kind of local business.</em></h1>
          <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
            Pick your category. Reevo configures the AI tone, QR placement, and funnel template in one click.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 0 40px" }}>
        <div className="container">
          <div className="row" style={{ flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {INDUSTRY_DATA.map(ind => (
              <button key={ind.id} onClick={() => setActive(ind.id)} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 16px", borderRadius: 999,
                background: active === ind.id ? "var(--ink)" : "var(--surface)",
                color: active === ind.id ? "var(--bg)" : "var(--ink-2)",
                border: "1px solid " + (active === ind.id ? "var(--ink)" : "var(--border)"),
                fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all .2s",
              }}>
                <span style={{ fontSize: 16 }}>{ind.icon}</span> {ind.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container">
          <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-lg)", borderRadius: 24 }}>
            <div style={{ padding: "40px 48px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center", background: `linear-gradient(135deg, color-mix(in oklab, ${cur.color} 14%, var(--surface)), var(--surface) 80%)`, position: "relative", overflow: "hidden" }} className="ind-detail-grid">
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="row" style={{ gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, color-mix(in oklab, ${cur.color} 25%, white), color-mix(in oklab, ${cur.color} 10%, white))`, color: cur.color, display: "grid", placeItems: "center", fontSize: 28 }}>{cur.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: cur.color, letterSpacing: "0.06em" }}>{cur.tag ? cur.tag.toUpperCase() : "INDUSTRY"}</div>
                    <h3 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>{cur.name}</h3>
                  </div>
                </div>
                <p className="lead" style={{ marginTop: 12, fontSize: 17 }}>{cur.pitch}</p>
                <div className="row" style={{ marginTop: 24, gap: 12 }}>
                  {cur.stats.map(s => (
                    <div key={s.k} style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{s.k.toUpperCase()}</div>
                      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "32px 0 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {cur.bullets.map((b, i) => (
                    <li key={i} className="row" style={{ gap: 8, fontSize: 14, color: "var(--ink-2)" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 999, background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Icon name="check" size={10} stroke={2.4} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="row" style={{ marginTop: 28, gap: 10 }}>
                  <button className="btn btn-primary" onClick={() => navigate("signup")}>Start with this template <Icon name="arrow" size={14} /></button>
                  <button className="btn btn-ghost" onClick={() => navigate("contact")}>Book a demo</button>
                </div>
              </div>

              <div className="row" style={{ justifyContent: "center" }}>
                <MobileFunnel business={cur.name.replace(" & Beauty", "").replace(" & Healthcare", "").replace(" & Fitness", "") + " · Demo"} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid var(--border)" }} className="ind-detail-stats">
              <div style={{ padding: 28, borderRight: "1px solid var(--border)" }}>
                <div className="kicker">REVIEW VELOCITY</div>
                <h4 style={{ margin: "4px 0 16px", fontSize: 18 }}>Reviews per day in this category</h4>
                <AreaChart data={cur.series.map((v, i) => ({ x: `D${i+1}`, v }))} w={500} h={160} color={cur.color} color2={cur.color} animate={false} />
              </div>
              <div style={{ padding: 28 }}>
                <div className="kicker">FUNNEL TEMPLATE</div>
                <h4 style={{ margin: "4px 0 16px", fontSize: 18 }}>Recommended placement</h4>
                <div className="col" style={{ gap: 10 }}>
                  {cur.bullets.map((b, i) => (
                    <div key={i} className="row" style={{ gap: 10, padding: "10px 12px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10 }}>
                      <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", width: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <style>{`
            @media (max-width: 900px) {
              .ind-detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; padding: 28px !important; }
              .ind-detail-stats { grid-template-columns: 1fr !important; }
              .ind-detail-stats > div { border-right: none !important; border-bottom: 1px solid var(--border); }
            }
          `}</style>
        </div>
      </section>

      <IndustriesGrid navigate={navigate} setActive={setActive} />

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container"><CTABanner navigate={navigate} /></div>
      </section>
    </div>
  );
};

const IndustriesGrid = ({ navigate, setActive }) => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
    <div className="container">
      <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
        <span className="eyebrow"><span className="dot" /> All industries</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Browse all categories.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="ind-grid">
        {INDUSTRY_DATA.map((ind) => (
          <div key={ind.id} className="card lift" style={{ padding: 22, cursor: "pointer" }} onClick={() => { setActive(ind.id); window.scrollTo({ top: 280, behavior: "smooth" }); }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, color-mix(in oklab, ${ind.color} 22%, white), color-mix(in oklab, ${ind.color} 8%, white))`, color: ind.color, display: "grid", placeItems: "center", fontSize: 20 }}>{ind.icon}</div>
              <Sparkline data={ind.series} w={46} h={18} color={ind.color} />
            </div>
            <h4 style={{ margin: 0, fontSize: 15 }}>{ind.name}</h4>
            <div className="row" style={{ marginTop: 10, gap: 6 }}>
              <span className="chip green" style={{ fontSize: 10 }}>{ind.stats[0].v}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) { .ind-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  </section>
);

Object.assign(window, { IndustriesPage });
