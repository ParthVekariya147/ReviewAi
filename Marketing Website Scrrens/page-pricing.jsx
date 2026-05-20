/* global React, Icon, PricingCards, FAQList, CTABanner, Avatar */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const PricingPage = ({ navigate }) => {
  const [yearly, setYearly] = useState(true);
  return (
    <div data-screen-label="03 Pricing">
      <section className="section" style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}>
        <div className="bg-gradients" />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 760 }}>
          <span className="eyebrow"><span className="dot" /> Pricing</span>
          <h1 className="h1" style={{ marginTop: 18 }}>Pricing that scales with <em>your reviews,</em> not your revenue.</h1>
          <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
            Start free, no credit card. Upgrade only when you need unlimited reviews, multi-location, or advanced analytics.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 0 80px" }}>
        <div className="container">
          <PricingCards defaultYearly={yearly} />
        </div>
      </section>

      <PricingComparison />
      <EnterpriseStrip navigate={navigate} />
      <PricingFAQ />

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container"><CTABanner navigate={navigate} /></div>
      </section>
    </div>
  );
};

const PricingComparison = () => {
  const ROWS = [
    { group: "Funnels", items: [
      ["Locations", "1", "Up to 5", "Unlimited"],
      ["QR codes", "1 static", "Unlimited dynamic", "Unlimited dynamic + printed kit"],
      ["Active campaigns", "1", "10", "Unlimited"],
      ["Branded domain", false, true, true],
    ]},
    { group: "AI", items: [
      ["Reviews per month", "30", "Unlimited", "Unlimited"],
      ["AI suggestion model", "GPT-3.5", "GPT-4", "GPT-4 + tone training"],
      ["Languages", "1", "8", "24"],
      ["Custom voice training", false, false, true],
    ]},
    { group: "Analytics", items: [
      ["Real-time dashboards", true, true, true],
      ["Funnel breakdown", "Basic", "Advanced", "Advanced + cohorts"],
      ["Device & geo analytics", false, true, true],
      ["Export to CSV / API", false, true, true],
    ]},
    { group: "Workspace", items: [
      ["Team seats", "1", "5", "Unlimited"],
      ["Role-based access", false, false, true],
      ["SSO (Google, SAML)", false, false, true],
      ["Audit log", false, false, true],
    ]},
    { group: "Support", items: [
      ["Email support", true, true, true],
      ["Priority support", false, true, true],
      ["Dedicated CSM", false, false, true],
      ["Onboarding session", false, "30 min", "2 hours"],
    ]},
  ];

  return (
    <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
          <span className="eyebrow"><span className="dot" /> Compare</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Full feature comparison.</h2>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "20px 24px", background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: 60, zIndex: 5 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>FEATURE</div>
            {["Starter", "Growth", "Business"].map((n, i) => (
              <div key={n} style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: i === 1 ? "var(--accent)" : "var(--ink)" }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{i === 0 ? "Free" : i === 1 ? "$23/mo" : "$71/mo"}</div>
              </div>
            ))}
          </div>
          {ROWS.map((g, gi) => (
            <React.Fragment key={gi}>
              <div style={{ padding: "20px 24px 8px", fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                {g.group.toUpperCase()}
              </div>
              {g.items.map(([label, ...vals], i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: i === g.items.length - 1 ? "none" : "1px solid var(--border)", alignItems: "center" }}>
                  <div style={{ fontSize: 14, color: "var(--ink-2)" }}>{label}</div>
                  {vals.map((v, j) => (
                    <div key={j}>
                      {v === true && <Icon name="check" size={16} className="text-muted" />}
                      {v === false && <span style={{ color: "var(--muted-2)", fontSize: 14 }}>—</span>}
                      {typeof v === "string" && <span style={{ fontSize: 13, color: "var(--ink-2)" }}>{v}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

const EnterpriseStrip = ({ navigate }) => (
  <section className="section">
    <div className="container">
      <div className="card" style={{
        padding: 40, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "center",
        background: "linear-gradient(135deg, var(--surface), var(--bg-soft))",
        borderRadius: 24, boxShadow: "var(--shadow-md)",
      }} className="ent-grid">
        <div>
          <span className="eyebrow"><span className="dot" /> Enterprise</span>
          <h3 className="h2" style={{ marginTop: 18, fontSize: "clamp(28px, 3vw, 36px)" }}>Franchises, multi-brand, agencies.</h3>
          <p className="lead" style={{ marginTop: 14, fontSize: 16 }}>
            Custom volume pricing, dedicated CSM, white-label, SSO, audit log, contractual SLA. Built for 50+ locations.
          </p>
          <div className="row" style={{ marginTop: 22, gap: 12 }}>
            <button className="btn btn-primary" onClick={() => navigate("contact")}>Talk to sales <Icon name="arrow" size={14} /></button>
            <button className="btn btn-ghost">Download SOC 2 report</button>
          </div>
        </div>
        <div className="col" style={{ gap: 10 }}>
          {[
            ["building", "Multi-tenant workspaces"],
            ["shield", "SOC 2 Type II + GDPR"],
            ["users", "SSO + SAML + SCIM"],
            ["bolt", "99.99% SLA"],
            ["link", "API + webhook integrations"],
          ].map(([i, l]) => (
            <div key={l} className="row" style={{ gap: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <Icon name={i} size={16} color="var(--accent)" />
              <span style={{ fontSize: 14 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .ent-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  </section>
);

const PricingFAQ = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
    <div className="container narrow">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span className="eyebrow"><span className="dot" /> Pricing FAQ</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Billing & plan questions.</h2>
      </div>
      <FAQList items={[
        { q: "Is there really a free plan?", a: "Yes — Starter is free forever, no card. Up to 30 AI-generated reviews per month and one static QR. Perfect for small shops or to evaluate the platform." },
        { q: "Can I switch between plans?", a: "Yes. Upgrade or downgrade any time from the billing page. Upgrades are prorated; downgrades take effect at the next billing cycle." },
        { q: "Do you charge per location?", a: "No per-location fees on Growth and Business. Growth includes up to 5 locations; Business is unlimited." },
        { q: "What happens if I exceed limits on the free plan?", a: "The funnel keeps working — but new AI suggestions pause once you hit 30 in a month. Reviews already in flight always complete." },
        { q: "Can I get an invoice?", a: "Yes. Every charge generates a downloadable PDF invoice with VAT, business name, and tax ID fields editable in billing." },
        { q: "Do you offer non-profit or education discounts?", a: "Yes — 50% off Growth and Business for verified non-profits and educational institutions. Contact sales to apply." },
      ]} />
    </div>
  </section>
);

Object.assign(window, { PricingPage });
