/* global React, Icon, FAQList, FAQItem, CTABanner */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const FAQ_GROUPS = [
  {
    title: "Getting started",
    items: [
      { q: "How fast can I be up and running?", a: "Around 3 minutes. Sign up, create a campaign, generate a QR, print it, stick it on something. The funnel works immediately." },
      { q: "Do I need to install anything?", a: "No. Reevo is 100% web. Customers scan a QR with their phone camera — no app, no login, no install. You manage everything from app.reevo.io in a browser." },
      { q: "Do I need to be technical?", a: "Not at all. The dashboard is designed for owners and managers, not engineers. Most setups take under 5 minutes with zero code." },
      { q: "Can I print the QR myself?", a: "Yes — Reevo gives you a high-resolution PNG / SVG / PDF that prints crisply at any size. We also ship printed kits (stickers, table tents, business cards) if you want." },
    ],
  },
  {
    title: "Reviews & AI",
    items: [
      { q: "How does the QR review funnel work?", a: "Scan → rate → see three AI-drafted review suggestions tuned to the rating and your business voice → tap copy → redirected to Google Reviews with the review on the clipboard → paste & post. Under 60 seconds end to end." },
      { q: "Does the AI write fake reviews?", a: "No. The AI drafts suggestions for the customer; the customer edits, picks one, or writes their own. The customer is always the author and posts from their Google account. Reevo never submits a review." },
      { q: "What if a customer gives a low rating?", a: "Low-rating funnels can be configured to route to private feedback instead of Google — so unhappy customers reach you first. Owners decide this per campaign." },
      { q: "What language is the AI in?", a: "24 languages auto-detected from device locale. You can pin a language per campaign or per location." },
      { q: "Can I review what the AI suggests before it's live?", a: "Yes. The dashboard has a 'preview' mode that shows what suggestions the AI would produce for any rating, voice, and language." },
    ],
  },
  {
    title: "Google compliance",
    items: [
      { q: "Is this allowed by Google?", a: "Yes. Google's policy prohibits fake reviews, review-buying, and review-gating that hides bad reviews. Reevo does none of these. We help real customers post real reviews from their own accounts. Every review is authentic." },
      { q: "Can I be suspended for using Reevo?", a: "No business on Reevo has ever been suspended for using the platform. The funnel respects Google's content policy and is built specifically to keep your profile compliant." },
      { q: "Do you 'gate' bad reviews?", a: "Review-gating (hiding negative reviews from Google) is against Google's rules and we don't support it. Low-rating funnels can collect private feedback for the owner, but every customer can always still post publicly if they choose." },
    ],
  },
  {
    title: "Customer experience",
    items: [
      { q: "Do customers need to log in?", a: "No login, no app, no account. Customers tap the QR and they're in the funnel. They only need to be signed into Google when they post — same as any review." },
      { q: "How long does the customer flow take?", a: "Average completion time is 52 seconds. We optimize for thumb-only, one-handed use." },
      { q: "What data do you collect from customers?", a: "Anonymous funnel events (scan, rating, copy, redirect). No PII unless the customer chooses to share contact info. GDPR and CCPA compliant." },
      { q: "What if the customer has no internet?", a: "The funnel is edge-cached and works on extremely slow connections. We've stress-tested it down to 2G." },
    ],
  },
  {
    title: "Analytics & tracking",
    items: [
      { q: "Can I track QR scans?", a: "Yes. Every scan is tracked with timestamp, device type, OS, country, and which QR / campaign / location was scanned. Real-time." },
      { q: "Can I see which QR codes work best?", a: "Yes. The analytics tab compares any number of QRs, campaigns, or locations side by side — by scan count, completion rate, or review velocity." },
      { q: "Can I export the data?", a: "Yes — CSV from any view on Growth and Business plans. Or use the REST API to pipe events into your warehouse." },
      { q: "Do you integrate with Google Analytics / GA4?", a: "Yes. Forward funnel events to GA4, Mixpanel, Segment, or your own data warehouse." },
    ],
  },
  {
    title: "Billing & plans",
    items: [
      { q: "How does subscription work?", a: "Pick a plan, pay monthly or yearly, cancel anytime. Upgrades are prorated. Downgrades take effect at next billing cycle. Yearly saves 20%." },
      { q: "Is there a free trial?", a: "Growth and Business get a 14-day free trial — no credit card. Starter is free forever." },
      { q: "What payment methods?", a: "All major cards via Stripe. ACH and wire for Business and Enterprise. EU & UK SEPA supported." },
      { q: "Can I get a refund?", a: "Yes — we offer a 30-day money-back guarantee on any paid plan. Email billing@reevo.io." },
    ],
  },
  {
    title: "Security & data",
    items: [
      { q: "Where is data stored?", a: "Primary in AWS us-east-1; EU mirror in eu-west-1 for EU customers. Encrypted at rest (AES-256) and in transit (TLS 1.3)." },
      { q: "Are you SOC 2 / GDPR compliant?", a: "SOC 2 Type II report available under NDA. GDPR + CCPA compliant by default. DPA available on request." },
      { q: "Can I delete my data?", a: "Yes. Self-serve account deletion from settings. We hard-delete within 30 days, no backups retained past that." },
      { q: "Who owns the data?", a: "You do. Reevo is the processor; you're the controller. Export anytime, delete anytime." },
    ],
  },
];

const FAQPage = ({ navigate }) => {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = FAQ_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(it =>
      it.q.toLowerCase().includes(query.toLowerCase()) ||
      it.a.toLowerCase().includes(query.toLowerCase())
    ),
  }));

  return (
    <div data-screen-label="07 FAQ">
      <section className="section" style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}>
        <div className="bg-gradients" />
        <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 720 }}>
          <span className="eyebrow"><span className="dot" /> FAQ</span>
          <h1 className="h1" style={{ marginTop: 18 }}>Frequently asked, <em>thoroughly answered.</em></h1>
          <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
            Everything we get asked about Reevo. Can't find what you need? <a onClick={() => navigate("contact")} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}>Ask us directly.</a>
          </p>
          <div style={{ position: "relative", maxWidth: 480, margin: "32px auto 0" }}>
            <Icon name="scan" size={16} className="" />
            <input className="input" placeholder="Search questions…" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 38 }} />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M16 16l4 4"/></svg>
            </span>
          </div>
        </div>
      </section>

      <section style={{ padding: "20px 0 100px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 56 }} className="faq-grid">
            <div className="sticky-aside">
              <div className="col" style={{ gap: 4 }}>
                {FAQ_GROUPS.map((g, i) => (
                  <button key={i} onClick={() => { setActive(i); document.getElementById(`faq-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{
                    all: "unset", cursor: "pointer", padding: "10px 14px", borderRadius: 8,
                    fontSize: 14, fontWeight: active === i ? 500 : 400,
                    color: active === i ? "var(--accent)" : "var(--ink-2)",
                    background: active === i ? "var(--accent-soft)" : "transparent",
                  }}>{g.title}</button>
                ))}
              </div>
              <div className="card" style={{ padding: 20, marginTop: 28, background: "var(--bg-soft)" }}>
                <div className="row" style={{ gap: 8, marginBottom: 8 }}><Icon name="mail" size={14} color="var(--accent)" /><strong style={{ fontSize: 13 }}>Still stuck?</strong></div>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>Email <a style={{ color: "var(--accent)" }}>support@reevo.io</a> — we reply in under 2 hours.</p>
              </div>
            </div>

            <div className="col" style={{ gap: 48 }}>
              {filtered.map((g, gi) => g.items.length > 0 && (
                <div key={gi} id={`faq-${gi}`}>
                  <h2 style={{ fontSize: 22, letterSpacing: "-0.015em", margin: "0 0 8px" }}>{g.title}</h2>
                  <FAQList items={g.items} />
                </div>
              ))}
              {filtered.every(g => g.items.length === 0) && (
                <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
                  No questions match "{query}". <a onClick={() => navigate("contact")} style={{ color: "var(--accent)", cursor: "pointer" }}>Ask us directly.</a>
                </div>
              )}
            </div>
          </div>
          <style>{`@media (max-width: 900px) { .faq-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0, paddingTop: 0 }}>
        <div className="container"><CTABanner navigate={navigate} /></div>
      </section>
    </div>
  );
};

Object.assign(window, { FAQPage });
