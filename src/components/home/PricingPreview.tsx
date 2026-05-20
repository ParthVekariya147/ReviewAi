"use client";

import { useState } from "react";
import Link from "next/link";

const CheckIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);
const MinusIcon = () => (
  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M5 12h14" />
  </svg>
);
const ArrowIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
  </svg>
);

const PLANS = [
  {
    id: "free", name: "Starter", sub: "For trying Reevo with one location.",
    monthly: 0, yearly: 0, cta: "Start free",
    features: [["1 location", true],["Up to 30 reviews / month", true],["1 static QR code", true],["Basic AI suggestions", true],["Standard analytics", true],["Custom branding", false],["Multi-location", false],["Priority support", false]],
  },
  {
    id: "growth", name: "Growth", sub: "For single-location businesses serious about reviews.",
    monthly: 29, yearly: 23, cta: "Start 14-day trial", popular: true,
    features: [["Up to 5 locations", true],["Unlimited reviews", true],["Dynamic QR codes", true],["GPT-4 review suggestions", true],["Advanced funnel analytics", true],["Custom branding & domain", true],["Multi-staff accounts", true],["Priority support", false]],
  },
  {
    id: "business", name: "Business", sub: "For multi-location and franchise teams.",
    monthly: 89, yearly: 71, cta: "Start 14-day trial",
    features: [["Unlimited locations", true],["Unlimited reviews", true],["Dynamic + printed QR kit", true],["AI suggestions + tone tuning", true],["Cohort & device analytics", true],["Custom branding & domain", true],["SSO + role-based access", true],["Priority + dedicated CSM", true]],
  },
];

export default function PricingPreview() {
  const [yearly, setYearly] = useState(true);

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px" }}>
          <span className="eyebrow"><span className="dot" /> Pricing</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Simple, predictable pricing.</h2>
          <p className="lead" style={{ margin: "16px auto 0" }}>
            Start free. Upgrade when you outgrow it. No setup fees, no review caps on paid plans, no annual lock-in.
          </p>
        </div>

        <div className="col" style={{ gap: 28, alignItems: "center" }}>
          <div className="tabs">
            <button className={!yearly ? "on" : ""} onClick={() => setYearly(false)}>Monthly</button>
            <button className={yearly ? "on" : ""} onClick={() => setYearly(true)}>
              Yearly <span className="chip accent" style={{ marginLeft: 6, fontSize: 10, padding: "2px 8px" }}>Save 20%</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, width: "100%" }} className="pricing-grid">
            {PLANS.map((plan) => {
              const price = yearly ? plan.yearly : plan.monthly;
              return (
                <div
                  key={plan.id}
                  className="card lift"
                  style={{
                    padding: 28,
                    border: plan.popular ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                    position: "relative",
                    boxShadow: plan.popular
                      ? "0 30px 60px -30px color-mix(in oklab, var(--accent) 35%, transparent), var(--shadow-md)"
                      : "var(--shadow-sm)",
                    background: plan.popular
                      ? "linear-gradient(180deg, color-mix(in oklab, var(--accent) 4%, var(--surface)) 0%, var(--surface) 30%)"
                      : "var(--surface)",
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: "absolute", top: -12, left: 24, padding: "4px 12px", fontSize: 11, fontWeight: 600, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", borderRadius: 999, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 13, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{plan.name.toUpperCase()}</div>
                    <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em" }}>${price}</span>
                      <span style={{ color: "var(--muted)", fontSize: 14 }}>/ mo</span>
                    </div>
                    {yearly && plan.monthly > 0 && (
                      <div style={{ marginTop: 2, fontSize: 12, color: "var(--muted)" }}>${plan.monthly}/mo billed monthly</div>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 14, marginBottom: 20, lineHeight: 1.5 }}>{plan.sub}</p>
                  <Link
                    href="/signup"
                    className={"btn " + (plan.popular ? "btn-accent" : "btn-primary")}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    {plan.cta} <ArrowIcon />
                  </Link>
                  <div style={{ marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>INCLUDED</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {plan.features.map(([label, on], i) => (
                        <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: on ? "var(--ink-2)" : "var(--muted-2)" }}>
                          <span style={{ width: 18, height: 18, borderRadius: 999, background: on ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "var(--surface-2)", color: on ? "var(--accent)" : "var(--muted-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                            {on ? <CheckIcon /> : <MinusIcon />}
                          </span>
                          {label as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link href="/pricing" className="btn btn-ghost">
            Compare every plan <ArrowIcon />
          </Link>
        </div>

        <style>{`@media (max-width: 1000px) { .pricing-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}
