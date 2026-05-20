/* global React, Icon, AreaChart, BarChart, Donut, FunnelChart, Sparkline, QRPattern, MobileFunnel, DashboardPreview, Avatar */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const FeaturesPage = ({ navigate }) => (
  <div data-screen-label="02 Features">
    <FeaturesHero navigate={navigate} />
    <FeatureDeepDives />
    <FeatureComparison />
    <FeaturesCTA navigate={navigate} />
  </div>
);

const FeaturesHero = ({ navigate }) => (
  <section className="section" style={{ paddingTop: 80, paddingBottom: 64, position: "relative", overflow: "hidden" }}>
    <div className="bg-gradients" />
    <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 820 }}>
      <span className="eyebrow"><span className="dot" /> Platform</span>
      <h1 className="h1" style={{ marginTop: 18 }}>One platform for every part of <em>your review pipeline.</em></h1>
      <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
        From the QR a customer scans to the dashboard your CFO loves — Reevo is the only tool you need to turn visits into authentic Google reviews.
      </p>
      <div className="row" style={{ justifyContent: "center", gap: 12, marginTop: 32 }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("signup")}>
          Start free trial <Icon name="arrow" size={15} />
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => navigate("contact")}>Talk to sales</button>
      </div>
    </div>
  </section>
);

/* deep-dive sections — alternate left/right */
const Deep = ({ flip, eyebrow, title, body, bullets, visual }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center",
    direction: flip ? "rtl" : "ltr",
  }} className="deep-grid">
    <div style={{ direction: "ltr" }}>
      <span className="eyebrow"><span className="dot" /> {eyebrow}</span>
      <h3 className="h2" style={{ marginTop: 18, fontSize: "clamp(28px, 3.2vw, 40px)" }}>{title}</h3>
      <p className="lead" style={{ marginTop: 18, fontSize: 17 }}>{body}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {bullets.map((b, i) => (
          <li key={i} className="row" style={{ alignItems: "flex-start", gap: 12 }}>
            <span style={{ width: 22, height: 22, borderRadius: 999, background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 2 }}>
              <Icon name="check" size={13} stroke={2.2} />
            </span>
            <div>
              <strong style={{ fontSize: 15, color: "var(--ink)" }}>{b.title}</strong>
              <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>{b.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
    <div style={{ direction: "ltr" }}>{visual}</div>
  </div>
);

const FeatureDeepDives = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
    <div className="container" style={{ display: "flex", flexDirection: "column", gap: 120 }}>

      <Deep
        eyebrow="QR funnels"
        title="QR codes that adapt to your campaign."
        body="Static QRs print once and live forever. Dynamic QRs route to different funnels by hour, location, language, or campaign — without reprinting."
        bullets={[
          { title: "Dynamic destination", body: "Change where a QR points without changing the printed code." },
          { title: "Per-location codes", body: "Generate, label, and download QR kits for every venue." },
          { title: "Smart routing rules", body: "Hour-of-day, weekday, language, or A/B test variants." },
        ]}
        visual={
          <div className="card" style={{ padding: 32, background: "var(--surface)", borderRadius: 24, boxShadow: "var(--shadow-md)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {["Maison HQ", "Maison East", "Maison Online", "Maison Pop-up"].map((n, i) => (
                <div key={n} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 14, textAlign: "center", background: "var(--bg-soft)" }}>
                  <QRPattern size={88} label={n} />
                  <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>r.evo/{n.toLowerCase().split(" ").join("-")}</div>
                  {i === 0 && <span className="chip green" style={{ fontSize: 10, marginTop: 6 }}>ACTIVE</span>}
                  {i === 3 && <span className="chip" style={{ fontSize: 10, marginTop: 6 }}>PAUSED</span>}
                </div>
              ))}
            </div>
          </div>
        }
      />

      <Deep
        flip
        eyebrow="AI suggestions"
        title="GPT-4 powered review suggestions, tuned to your brand."
        body="Every customer sees three review drafts matched to their rating and your business voice. They edit, choose, or write their own — you're never the author."
        bullets={[
          { title: "Tone controls", body: "Pick from Casual, Professional, Warm, Witty — or train a custom voice." },
          { title: "Rating-aware drafts", body: "5★ feels different from 3★. Suggestions reflect that." },
          { title: "Multilingual", body: "Auto-detects language from device locale. 24 languages supported." },
        ]}
        visual={
          <div className="card" style={{ padding: 24, background: "var(--surface)", borderRadius: 24, boxShadow: "var(--shadow-md)" }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <div className="row" style={{ gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", display: "grid", placeItems: "center" }}>
                  <Icon name="sparkles" size={14} />
                </div>
                <strong style={{ fontSize: 14 }}>Reevo AI · 5★ suggestion</strong>
              </div>
              <span className="chip accent">Friendly</span>
            </div>
            {[
              "Absolutely loved my visit! The team was warm and the croissants were unreal. Will be back this weekend with friends.",
              "Best café in the neighborhood — staff knew my order by the third visit. Cozy, fast, and the coffee is genuinely great.",
              "Stumbled in for a quick latte and stayed an hour. Beautiful little spot with friendly people and excellent food.",
            ].map((s, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start", padding: 12, background: i === 0 ? "var(--accent-soft)" : "var(--bg-soft)", border: i === 0 ? "1px solid color-mix(in oklab, var(--accent) 30%, transparent)" : "1px solid var(--border)", borderRadius: 10, marginTop: i === 0 ? 0 : 8, gap: 10, fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>
                <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--surface-2)", color: i === 0 ? "white" : "var(--muted)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600 }}>{i+1}</span>
                <span>{s}</span>
              </div>
            ))}
            <div className="row" style={{ marginTop: 14, gap: 8 }}>
              <button className="btn btn-sm btn-accent">Use suggestion 1</button>
              <button className="btn btn-sm btn-ghost"><Icon name="sparkles" size={12} /> Regenerate</button>
            </div>
          </div>
        }
      />

      <Deep
        eyebrow="Funnel analytics"
        title="See every step. Find every leak."
        body="Reevo tracks the entire journey — scan, rating, AI generation, copy, redirect, posted review — and rolls it up into one funnel."
        bullets={[
          { title: "End-to-end attribution", body: "Tie every Google review back to the campaign that produced it." },
          { title: "Cohort comparisons", body: "Compare locations, weekdays, or marketing pushes side by side." },
          { title: "Real-time dashboards", body: "No nightly batches — events stream in under 2 seconds." },
        ]}
        visual={
          <div className="card" style={{ padding: 24, boxShadow: "var(--shadow-md)" }}>
            <div className="between" style={{ marginBottom: 14 }}>
              <strong style={{ fontSize: 14 }}>Last 14 days</strong>
              <span className="chip accent">49.0% conv. rate</span>
            </div>
            <FunnelChart steps={[
              { label: "QR scans", v: 8421 },
              { label: "Rating selected", v: 6308 },
              { label: "AI review copied", v: 4912 },
              { label: "Redirected to Google", v: 3014 },
              { label: "Posted on Google", v: 1842 },
            ]} />
          </div>
        }
      />

      <Deep
        flip
        eyebrow="Campaign management"
        title="Run dozens of campaigns from one console."
        body="Spin up campaigns for a new location, a seasonal push, or an A/B test. Pause, clone, and archive without touching code."
        bullets={[
          { title: "Multi-campaign workspace", body: "Group campaigns by location, brand, or marketing push." },
          { title: "Scheduling", body: "Schedule starts, ends, and rule changes. Set it and forget it." },
          { title: "Approval workflow", body: "Drafts → review → publish. Optional approvers for franchises." },
        ]}
        visual={
          <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
            <table className="table">
              <thead><tr><th>Campaign</th><th>Status</th><th>Scans</th><th>Reviews</th></tr></thead>
              <tbody>
                {[
                  ["Autumn 2026", "live", 8421, 1842, "green"],
                  ["Weekend brunch", "live", 2103, 412, "green"],
                  ["Loyalty card", "scheduled", 0, 0, ""],
                  ["Summer pop-up", "ended", 5681, 1124, ""],
                ].map(([n, s, sc, rv, cl], i) => (
                  <tr key={i}>
                    <td><strong style={{ fontSize: 13 }}>{n}</strong></td>
                    <td><span className={"chip " + cl}>{s}</span></td>
                    <td className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{sc.toLocaleString()}</td>
                    <td className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>{rv.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />

      <Deep
        eyebrow="Branding"
        title="Looks and feels like your brand, not ours."
        body="Custom logo, colors, fonts, and even a domain (reviews.yourbiz.com). Reevo runs in the background — your customers see you."
        bullets={[
          { title: "Custom domain", body: "Funnels live on your subdomain with full SSL." },
          { title: "Brand kit", body: "Upload logo + brand colors once, every funnel inherits." },
          { title: "Tone of voice", body: "Train the AI on your past reviews or website copy." },
        ]}
        visual={
          <div className="card" style={{ padding: 0, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #18203F, #2E1F66)", padding: 32, textAlign: "center", color: "white" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", background: "rgba(255,255,255,0.08)", borderRadius: 999, fontSize: 13, marginBottom: 16 }}>
                <span style={{ fontWeight: 600 }}>maison.com</span><span style={{ opacity: 0.6 }}>/ reviews</span>
              </div>
              <div className="serif" style={{ fontSize: 36, letterSpacing: "-0.01em" }}>Maison Café</div>
              <p style={{ opacity: 0.7, fontSize: 14, marginTop: 4 }}>How was your visit today?</p>
              <div className="row" style={{ justifyContent: "center", marginTop: 14, gap: 4 }}><Stars value={5} size={28} /></div>
            </div>
            <div style={{ padding: 16, background: "var(--surface)" }}>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {["#18203F", "#2E1F66", "#F4A861", "#FFFFFF"].map(c => (
                  <div key={c} className="row" style={{ gap: 6, padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 999, fontSize: 11 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                    <span className="mono">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
      />
      <style>{`@media (max-width: 1000px) { .deep-grid { grid-template-columns: 1fr !important; gap: 48px !important; direction: ltr !important; } }`}</style>
    </div>
  </section>
);

const FeatureComparison = () => (
  <section className="section">
    <div className="container">
      <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px" }}>
        <span className="eyebrow"><span className="dot" /> Why Reevo</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Built for review velocity, not generic feedback.</h2>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Reevo</th>
              <th>Generic QR tools</th>
              <th>Review request emails</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["AI-drafted review suggestions", true, false, false],
              ["Mobile-first funnel UX", true, false, false],
              ["Dynamic QR routing", true, "partial", false],
              ["Real-time funnel analytics", true, false, "partial"],
              ["Google redirect attribution", true, false, false],
              ["Multi-location dashboard", true, false, true],
              ["Custom branding & domain", true, "partial", true],
              ["Average conversion rate", "49%", "8%", "12%"],
            ].map(([label, a, b, c], i) => (
              <tr key={i}>
                <td><strong style={{ fontSize: 13 }}>{label}</strong></td>
                <td><CompCell v={a} accent /></td>
                <td><CompCell v={b} /></td>
                <td><CompCell v={c} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

const CompCell = ({ v, accent }) => {
  if (v === true) return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, background: accent ? "color-mix(in oklab, var(--accent) 18%, transparent)" : "var(--surface-2)", color: accent ? "var(--accent)" : "var(--muted)" }}><Icon name="check" size={13} stroke={2.4} /></span>;
  if (v === false) return <span style={{ color: "var(--muted-2)" }}><Icon name="x" size={14} /></span>;
  if (v === "partial") return <span className="chip" style={{ fontSize: 11 }}>Partial</span>;
  return <span style={{ fontWeight: 500, color: accent ? "var(--accent)" : "var(--ink-2)", fontSize: 13 }}>{v}</span>;
};

const FeaturesCTA = ({ navigate }) => (
  <section className="section" style={{ paddingBottom: 0 }}>
    <div className="container"><CTABanner navigate={navigate} /></div>
  </section>
);

Object.assign(window, { FeaturesPage });
