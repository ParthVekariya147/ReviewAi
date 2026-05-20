/* global React, Icon, Avatar, Stars */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
/* =============================================================
   PricingCards — with monthly/yearly toggle
   ============================================================= */

const PRICING_PLANS = [
  {
    id: "free",
    name: "Starter",
    sub: "For trying Reevo with one location.",
    monthly: 0, yearly: 0,
    cta: "Start free",
    features: [
      ["1 location", true],
      ["Up to 30 reviews / month", true],
      ["1 static QR code", true],
      ["Basic AI suggestions", true],
      ["Standard analytics", true],
      ["Custom branding", false],
      ["Multi-location", false],
      ["Priority support", false],
    ],
  },
  {
    id: "growth",
    name: "Growth",
    sub: "For single-location businesses serious about reviews.",
    monthly: 29, yearly: 23,
    cta: "Start 14-day trial",
    popular: true,
    features: [
      ["Up to 5 locations", true],
      ["Unlimited reviews", true],
      ["Dynamic QR codes", true],
      ["GPT-4 review suggestions", true],
      ["Advanced funnel analytics", true],
      ["Custom branding & domain", true],
      ["Multi-staff accounts", true],
      ["Priority support", false],
    ],
  },
  {
    id: "business",
    name: "Business",
    sub: "For multi-location and franchise teams.",
    monthly: 89, yearly: 71,
    cta: "Start 14-day trial",
    features: [
      ["Unlimited locations", true],
      ["Unlimited reviews", true],
      ["Dynamic + printed QR kit", true],
      ["AI suggestions + tone tuning", true],
      ["Cohort & device analytics", true],
      ["Custom branding & domain", true],
      ["SSO + role-based access", true],
      ["Priority + dedicated CSM", true],
    ],
  },
];

const PricingCards = ({ defaultYearly = true, compact = false }) => {
  const [yearly, setYearly] = useState(defaultYearly);
  return (
    <div className="col" style={{ gap: 28, alignItems: "center" }}>
      <div className="tabs">
        <button className={!yearly ? "on" : ""} onClick={() => setYearly(false)}>Monthly</button>
        <button className={yearly ? "on" : ""} onClick={() => setYearly(true)}>
          Yearly <span className="chip accent" style={{ marginLeft: 6, fontSize: 10, padding: "2px 8px" }}>Save 20%</span>
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, width: "100%" }} className="pricing-grid">
        {PRICING_PLANS.map(plan => {
          const price = yearly ? plan.yearly : plan.monthly;
          return (
            <div key={plan.id} className="card lift" style={{
              padding: 28,
              border: plan.popular ? "1.5px solid var(--accent)" : "1px solid var(--border)",
              position: "relative",
              boxShadow: plan.popular ? "0 30px 60px -30px color-mix(in oklab, var(--accent) 35%, transparent), var(--shadow-md)" : "var(--shadow-sm)",
              background: plan.popular ? "linear-gradient(180deg, color-mix(in oklab, var(--accent) 4%, var(--surface)) 0%, var(--surface) 30%)" : "var(--surface)",
            }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -12, left: 24, padding: "4px 12px", fontSize: 11, fontWeight: 600, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", borderRadius: 999, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                  MOST POPULAR
                </div>
              )}
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
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
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 14, marginBottom: 20, lineHeight: 1.5 }}>{plan.sub}</p>
              <button className={"btn " + (plan.popular ? "btn-accent" : "btn-primary")} style={{ width: "100%", justifyContent: "center" }}>
                {plan.cta} <Icon name="arrow" size={14} />
              </button>
              <div style={{ marginTop: 22, borderTop: "1px solid var(--border)", paddingTop: 18 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.06em", fontFamily: "var(--font-mono)", marginBottom: 10 }}>INCLUDED</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map(([label, on], i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: on ? "var(--ink-2)" : "var(--muted-2)" }}>
                      <span style={{ width: 18, height: 18, borderRadius: 999, background: on ? "color-mix(in oklab, var(--accent) 12%, transparent)" : "var(--surface-2)", color: on ? "var(--accent)" : "var(--muted-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Icon name={on ? "check" : "minus"} size={11} stroke={2.2} />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        @media (max-width: 1000px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* =============================================================
   FAQ accordion
   ============================================================= */
const FAQItem = ({ q, a, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        all: "unset", display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", padding: "22px 0", cursor: "pointer", gap: 16,
      }}>
        <span style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>{q}</span>
        <span style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0, background: "var(--surface)", transition: "transform .25s, background .2s" }}>
          <Icon name={open ? "minus" : "plus"} size={15} />
        </span>
      </button>
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows .35s ease",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingBottom: 22, color: "var(--muted)", fontSize: 15, lineHeight: 1.6, maxWidth: 640 }}>{a}</div>
        </div>
      </div>
    </div>
  );
};

const FAQList = ({ items }) => (
  <div>
    {items.map((it, i) => <FAQItem key={i} q={it.q} a={it.a} defaultOpen={i === 0} />)}
  </div>
);

/* =============================================================
   Feature card
   ============================================================= */
const FeatureCard = ({ icon, title, body, preview }) => (
  <div className="card lift" style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--accent-2) 18%, transparent))",
      color: "var(--accent)",
      display: "grid", placeItems: "center", marginBottom: 14,
      border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)",
    }}>
      <Icon name={icon} size={18} />
    </div>
    <h4 style={{ margin: 0, fontSize: 17, letterSpacing: "-0.01em" }}>{title}</h4>
    <p style={{ margin: "8px 0 14px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55, flex: 1 }}>{body}</p>
    {preview && <div style={{ marginTop: "auto" }}>{preview}</div>}
  </div>
);

/* =============================================================
   Testimonial carousel
   ============================================================= */

const TESTIMONIALS = [
  {
    body: "We went from 12 Google reviews a month to 87. The funnel is so smooth our customers actually want to leave a review — and they're all 5-star.",
    name: "Sofía Reyes", role: "Owner, Maison Café", logo: "MAISON",
    metric: "+625% reviews in 8 weeks",
  },
  {
    body: "The AI suggestions are the magic. Customers tap copy, paste in Google, and post. We get authentic, well-written reviews without any awkwardness.",
    name: "Marcus Lin", role: "Founder, Sage Salon Group", logo: "SAGE",
    metric: "4.9★ average across 6 locations",
  },
  {
    body: "We rolled Reevo out to 23 dental clinics in two days. The analytics let us see exactly which front desks need a nudge.",
    name: "Dr. Priya N.", role: "Operations, Vista Dental", logo: "VISTA",
    metric: "23 locations, 1 dashboard",
  },
  {
    body: "I was sceptical about another QR thing, but my dry cleaner customers actually use it. It just works. Reviews are pouring in.",
    name: "Karim Adel", role: "Owner, Crisp Linen", logo: "CRISP",
    metric: "Live in 3 minutes",
  },
];

const TestimonialCarousel = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);
  const t = TESTIMONIALS[i];
  return (
    <div style={{ position: "relative" }}>
      <div className="card" style={{
        padding: "40px 44px",
        background: "linear-gradient(180deg, var(--surface), var(--bg-soft))",
        borderRadius: 24,
        boxShadow: "var(--shadow-md)",
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
          <Stars value={5} size={18} />
          <span className="chip accent">{t.metric}</span>
        </div>
        <p key={i} className="fade-up" style={{
          fontSize: 26, lineHeight: 1.35, letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 500, margin: 0, maxWidth: 920,
        }}>
          “{t.body}”
        </p>
        <div className="between" style={{ marginTop: 32 }}>
          <div className="row" style={{ gap: 14 }}>
            <Avatar name={t.name} size={48} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{t.role}</div>
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            {TESTIMONIALS.map((_, j) => (
              <button key={j} onClick={() => setI(j)} style={{
                width: j === i ? 24 : 8, height: 8, borderRadius: 999,
                background: j === i ? "var(--accent)" : "var(--border-strong)",
                border: 0, cursor: "pointer", transition: "width .3s, background .2s",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TestimonialGrid = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="t-grid">
    {TESTIMONIALS.slice(0, 6).map((t, i) => (
      <div key={i} className="card lift" style={{ padding: 24 }}>
        <Stars value={5} size={14} />
        <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-2)", marginTop: 12, marginBottom: 18 }}>“{t.body}”</p>
        <div className="row" style={{ gap: 10 }}>
          <Avatar name={t.name} size={36} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.role}</div>
          </div>
        </div>
      </div>
    ))}
    <style>{`@media (max-width: 900px) { .t-grid { grid-template-columns: 1fr !important; }}`}</style>
  </div>
);

/* =============================================================
   Step item (for "How it works")
   ============================================================= */
const StepBlock = ({ idx, title, body, children }) => (
  <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
      color: "white", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14,
      boxShadow: "0 8px 18px -8px color-mix(in oklab, var(--accent) 50%, transparent)",
    }}>
      {String(idx).padStart(2, "0")}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.015em" }}>{title}</h4>
      <p style={{ margin: "6px 0 14px", color: "var(--muted)", fontSize: 15, lineHeight: 1.55, maxWidth: 480 }}>{body}</p>
      {children}
    </div>
  </div>
);

/* =============================================================
   CTA Banner (final)
   ============================================================= */
const CTABanner = ({ navigate }) => (
  <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: "72px 64px",
    background: "linear-gradient(135deg, #0A0A14 0%, #1A1538 60%, #2D2070 100%)",
    color: "white",
    boxShadow: "0 40px 80px -30px rgba(40,30,120,0.4)",
  }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, color-mix(in oklab, var(--accent-2) 60%, transparent), transparent 50%), radial-gradient(circle at 10% 90%, color-mix(in oklab, var(--accent) 50%, transparent), transparent 50%)", opacity: 0.6 }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }} />
    <div style={{ position: "relative", maxWidth: 720 }}>
      <div className="eyebrow" style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
        <span className="dot" style={{ background: "white", boxShadow: "0 0 0 4px rgba(255,255,255,0.2)" }}/>
        Free 14-day trial — no card required
      </div>
      <h2 className="h1" style={{ color: "white", marginTop: 18, fontSize: "clamp(36px, 5vw, 64px)" }}>
        Start growing your Google reviews <em style={{ background: "linear-gradient(110deg, #C8C1FF, #8FC2FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>today.</em>
      </h2>
      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 18, maxWidth: 540, lineHeight: 1.55 }}>
        Print one QR code, start collecting authentic reviews tonight. Cancel anytime.
      </p>
      <div className="row" style={{ marginTop: 28, gap: 12 }}>
        <button className="btn btn-lg" style={{ background: "white", color: "#0A0A14", borderColor: "white" }} onClick={() => navigate("signup")}>
          Start free trial <Icon name="arrow" size={15} />
        </button>
        <button className="btn btn-lg" style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }} onClick={() => navigate("contact")}>
          Book a demo
        </button>
      </div>
    </div>
  </div>
);

Object.assign(window, {
  PricingCards, FAQItem, FAQList, FeatureCard,
  TestimonialCarousel, TestimonialGrid,
  StepBlock, CTABanner,
});
