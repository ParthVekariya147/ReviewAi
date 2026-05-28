"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
      background: "var(--surface)", transition: "border-color 0.15s",
      ...(open ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" } : {}),
    }}>
      <button
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", textAlign: "left", gap: 16, background: "transparent", border: 0, cursor: "pointer" }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4 }}>{q}</span>
        <svg
          width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke={open ? "var(--accent)" : "var(--muted)"}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: "transform 0.2s, stroke 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.22s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "0 22px 18px", borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "14px 0 0" }}>{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPageClient() {
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");

  const filtered = FAQ_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter(
      (it) =>
        it.q.toLowerCase().includes(query.toLowerCase()) ||
        it.a.toLowerCase().includes(query.toLowerCase())
    ),
  }));

  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section className="section" style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}>
          <div className="bg-gradients" />
          <div className="container" style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 720 }}>
            <span className="eyebrow"><span className="dot" /> FAQ</span>
            <h1 className="h1" style={{ marginTop: 18 }}>Frequently asked, <em>thoroughly answered.</em></h1>
            <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
              Everything we get asked about Reevo. Can&apos;t find what you need?{" "}
              <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "underline" }}>Ask us directly.</Link>
            </p>
            <div style={{ position: "relative", maxWidth: 480, margin: "32px auto 0" }}>
              <input
                className="input"
                placeholder="Search questions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M16 16l4 4"/></svg>
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: "20px 0 100px" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 56 }} className="faq-grid">
              {/* Sidebar */}
              <div className="sticky-aside">
                <div className="faq-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {FAQ_GROUPS.map((g, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActive(i);
                        document.getElementById(`faq-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      style={{
                        all: "unset", cursor: "pointer", padding: "10px 14px", borderRadius: 8,
                        fontSize: 14, fontWeight: active === i ? 500 : 400,
                        color: active === i ? "var(--accent)" : "var(--ink-2)",
                        background: active === i ? "var(--accent-soft)" : "transparent",
                      }}
                    >
                      {g.title}
                    </button>
                  ))}
                </div>
                <div className="card" style={{ padding: 20, marginTop: 28, background: "var(--bg-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                    <strong style={{ fontSize: 13 }}>Still stuck?</strong>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                    Email <a href="mailto:support@reevo.io" style={{ color: "var(--accent)" }}>support@reevo.io</a> — we reply in under 2 hours.
                  </p>
                </div>
              </div>

              {/* FAQ groups */}
              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {filtered.map((g, gi) =>
                  g.items.length > 0 ? (
                    <div key={gi} id={`faq-${gi}`}>
                      <h2 style={{ fontSize: 22, letterSpacing: "-0.015em", margin: "0 0 16px" }}>{g.title}</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {g.items.map((item, ii) => (
                          <AccordionItem key={ii} q={item.q} a={item.a} />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
                {filtered.every((g) => g.items.length === 0) && (
                  <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>
                    No questions match &quot;{query}&quot;.{" "}
                    <Link href="/contact" style={{ color: "var(--accent)" }}>Ask us directly.</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .faq-grid { grid-template-columns: 1fr !important; }
          .faq-grid .sticky-aside { position: static !important; top: 0 !important; }
          .faq-sidebar-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
