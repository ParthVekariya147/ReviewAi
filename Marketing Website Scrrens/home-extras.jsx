/* global React, Icon, MobileFunnel, QRPattern, Sparkline, PricingCards, FAQList, TestimonialCarousel, TestimonialGrid, CTABanner, Stars */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
/* ===== INDUSTRIES STRIP (on home) ===== */
const INDUSTRIES = [
  { id: "restaurants", name: "Restaurants", icon: "🍽️", color: "#F4A861", lift: "+340% reviews", desc: "Table tents, receipt QRs, post-meal scans.", series: [12,14,18,20,24,28,32,36] },
  { id: "salons", name: "Salons & Beauty", icon: "💇", color: "#E48BD3", lift: "+280% reviews", desc: "QR at the chair, post-service flow.", series: [8,10,14,18,22,24,28,32] },
  { id: "clinics", name: "Clinics", icon: "🩺", color: "#67C3F2", lift: "+410% reviews", desc: "Reception stickers, after-care emails.", series: [6,9,12,16,22,26,32,38] },
  { id: "drycleaners", name: "Dry Cleaners", icon: "👔", color: "#9C8FF1", lift: "+220% reviews", desc: "Garment tag QR, pickup-time prompt.", series: [4,6,8,10,12,16,20,24] },
  { id: "gyms", name: "Gyms", icon: "🏋️", color: "#7CD8A9", lift: "+260% reviews", desc: "Locker QR, end-of-class flow.", series: [10,12,14,18,22,26,30,34] },
  { id: "retail", name: "Retail", icon: "🛍️", color: "#F58592", lift: "+190% reviews", desc: "Counter QR, bag inserts.", series: [14,16,18,20,22,26,28,30] },
  { id: "cafes", name: "Cafés", icon: "☕", color: "#C49A6C", lift: "+310% reviews", desc: "Cup-sleeve QR, receipt nudge.", series: [10,14,18,22,28,32,36,42] },
  { id: "services", name: "Service providers", icon: "🛠️", color: "#9FBE8C", lift: "+240% reviews", desc: "Invoice QR, job-done texts.", series: [6,8,12,14,16,20,22,26] },
];

const IndustriesStrip = ({ navigate }) => (
  <section className="section">
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 48 }} className="ig-head">
        <div>
          <span className="eyebrow"><span className="dot" /> Industries</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Built for every kind of local business.</h2>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginBottom: 8 }}>
          Pre-tuned funnel templates and AI tone presets for the eight most common review-driven business categories.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="industries-grid">
        {INDUSTRIES.map((ind) => (
          <div key={ind.id} className="card lift" style={{ padding: 22, cursor: "pointer" }} onClick={() => navigate("industries")}>
            <div className="between" style={{ marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `linear-gradient(135deg, color-mix(in oklab, ${ind.color} 24%, white), color-mix(in oklab, ${ind.color} 8%, white))`,
                color: ind.color, display: "grid", placeItems: "center", fontSize: 22,
              }}>{ind.icon}</div>
              <Sparkline data={ind.series} w={50} h={20} color={ind.color} />
            </div>
            <h4 style={{ margin: 0, fontSize: 17, letterSpacing: "-0.01em" }}>{ind.name}</h4>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 14px", lineHeight: 1.5 }}>{ind.desc}</p>
            <div className="row" style={{ gap: 8 }}>
              <span className="chip green">{ind.lift}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 1100px) { .industries-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 600px) { .industries-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px) { .ig-head { grid-template-columns: 1fr !important; gap: 16px !important; } }
      `}</style>
    </div>
  </section>
);

/* ===== MOBILE EXPERIENCE ===== */
const MobileExperience = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="me-grid">
        <div>
          <span className="eyebrow"><span className="dot" /> Mobile-first</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Built for the customer's thumb, not your designer.</h2>
          <p className="lead" style={{ marginTop: 18 }}>
            Reevo funnels are mobile-only — every pixel is tuned for a one-handed, 47-second flow. Average completion time: <strong style={{ color: "var(--ink)" }}>52 seconds</strong>.
          </p>

          <div className="col" style={{ gap: 14, marginTop: 28 }}>
            {[
              { i: "bolt", t: "Loads in 0.4s", d: "Edge-cached, no fonts to download, no app to install." },
              { i: "scan", t: "Native QR, native UX", d: "Camera-app native — no extra apps, no friction, no confusion." },
              { i: "sparkles", t: "One-tap AI suggestions", d: "Three reviews ready before they finish reading the question." },
              { i: "shield", t: "Privacy-first", d: "Zero PII collected. Just ratings, scans, and clicks. GDPR & CCPA ready." },
            ].map((f, i) => (
              <div key={i} className="row" style={{ gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--accent)", flexShrink: 0 }}>
                  <Icon name={f.i} size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>{f.t}</div>
                  <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
          <div className="bg-gradients" style={{ opacity: 0.4 }} />
          <div style={{ position: "relative" }}>
            <MobileFunnel business="Sage Salon" />
          </div>
          <div className="floater" style={{ left: -20, top: 60 }}>
            <Icon name="bolt" size={18} color="var(--accent)" />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>Loaded in 0.4s</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Edge cached globally</div>
            </div>
          </div>
          <div className="floater" style={{ right: -30, bottom: 80 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>AVG. COMPLETION</div>
              <div className="row" style={{ gap: 6 }}>
                <strong style={{ fontSize: 18, letterSpacing: "-0.02em" }}>52s</strong>
                <span style={{ color: "#117047", fontSize: 11 }}>-12s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 1000px) { .me-grid { grid-template-columns: 1fr !important; gap: 56px !important; } }`}</style>
    </div>
  </section>
);

/* ===== PRICING PREVIEW ===== */
const PricingPreview = ({ navigate }) => (
  <section className="section">
    <div className="container">
      <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 48px" }}>
        <span className="eyebrow"><span className="dot" /> Pricing</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Simple, predictable pricing.</h2>
        <p className="lead" style={{ margin: "16px auto 0" }}>
          Start free. Upgrade when you outgrow it. No setup fees, no review caps on paid plans, no annual lock-in.
        </p>
      </div>
      <PricingCards />
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <button className="btn btn-ghost" onClick={() => navigate("pricing")}>
          Compare every plan <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  </section>
);

/* ===== TESTIMONIALS ===== */
const TestimonialsSection = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
    <div className="container">
      <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 48px" }}>
        <span className="eyebrow"><span className="dot" /> Customers</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Owners who replaced "leave us a review" cards forever.</h2>
      </div>
      <TestimonialCarousel />
      <div style={{ marginTop: 24 }}>
        <TestimonialGrid />
      </div>
    </div>
  </section>
);

/* ===== HOME FAQ ===== */
const HomeFAQ = ({ navigate }) => (
  <section className="section">
    <div className="container narrow">
      <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
        <span className="eyebrow"><span className="dot" /> FAQ</span>
        <h2 className="h2" style={{ marginTop: 18 }}>Questions, answered straight.</h2>
      </div>
      <FAQList items={[
        { q: "How does the QR review funnel work?",
          a: "Customers scan your printed QR with their phone camera (no app), tap a rating, and see three AI-drafted review options based on that rating. They tap copy, get redirected to your Google Business profile, paste, and post. The whole flow takes under a minute." },
        { q: "Is this Google compliant?",
          a: "Yes. Reevo never writes a fake review and never submits anything for the customer — it just helps them write their own. Every review is posted by a real customer from their own Google account. We follow Google's content policy and review-soliciting guidelines." },
        { q: "Do customers need to log in?",
          a: "No login, no app, no account. Customers tap your QR and they're in the funnel. They only need to be signed into Google when they paste their review — same as any review." },
        { q: "Can I track QR scans?",
          a: "Every scan, rating, AI generation, copy event, redirect, and posted review is tracked and tied back to the campaign, location, and device. You see the full funnel in real time." },
        { q: "Does AI generate the review?",
          a: "AI drafts three suggestions for the customer to choose from based on the rating they selected. The customer edits, picks one, or writes their own. You're never the author — your customer is." },
        { q: "How does subscription work?",
          a: "Pick a plan (Starter is free), pay monthly or yearly, cancel anytime from your dashboard. Yearly saves 20%. No setup fees, no charges for additional reviews, no surprises." },
      ]} />
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button className="btn btn-ghost" onClick={() => navigate("faq")}>
          See all questions <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  </section>
);

/* ===== FINAL CTA ===== */
const FinalCTA = ({ navigate }) => (
  <section className="section" style={{ paddingBottom: 0 }}>
    <div className="container">
      <CTABanner navigate={navigate} />
    </div>
  </section>
);

Object.assign(window, {
  IndustriesStrip, MobileExperience, PricingPreview,
  TestimonialsSection, HomeFAQ, FinalCTA,
});
