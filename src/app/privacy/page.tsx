"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    title: "Overview",
    body: [
      "Reevo Technologies, Inc. (\"Reevo\", \"we\", \"us\") provides a software platform that helps local businesses request and convert authentic Google reviews from their real customers. This Privacy Policy describes what data we collect, why we collect it, how we use it, and the rights you have over it.",
      "We are committed to collecting the minimum information necessary to provide our service. We are GDPR and CCPA compliant by default and offer regional data residency for EU customers.",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "From business customers, we collect: account information (name, email, business name, billing info), workspace data (campaigns, QR codes, branding settings), and usage telemetry (which pages you visit in the dashboard, which features you use).",
      "From customers of our customers (review submitters), we collect anonymous funnel events only:",
      {
        list: [
          "Scan timestamp and originating QR / campaign / location ID",
          "Device type, operating system, and approximate country (geolocated from IP, not stored)",
          "Rating selected, AI suggestion shown, copy action, redirect action",
          "We do not collect names, emails, or any personally identifying information from review submitters unless they voluntarily provide contact info via an optional feedback field.",
        ],
      },
    ],
  },
  {
    title: "How we use information",
    body: [
      "We use account and workspace data to operate the service: authenticate you, render your dashboard, route reviews, generate AI suggestions, and bill you.",
      "We use funnel telemetry to power the analytics in your dashboard and to improve our own product (in aggregate). We never sell data, and we never use customer funnel data to train AI models served to other Reevo customers.",
    ],
  },
  {
    title: "AI suggestions & content",
    body: [
      "Reevo's AI suggestion engine generates draft review text based on the customer's selected rating and your business's configured voice. The customer is always the author of the final review — they edit, choose among options, or write their own.",
      "AI prompts and outputs are stored for 30 days for debugging and abuse-prevention purposes, then deleted. They are not used to train external models or shared with third parties.",
    ],
  },
  {
    title: "How we share information",
    body: [
      "We never sell customer data. We share data only with subprocessors that help us operate the service (cloud hosting, payment processing, customer support tooling, email delivery), and only the minimum required.",
      "A current list of subprocessors is published at reevo.io/subprocessors and updated 30 days before any change.",
    ],
  },
  {
    title: "Data retention",
    body: [
      "Account data is retained for the life of your subscription. After cancellation, we hard-delete account data within 30 days unless you request earlier deletion or legal hold applies.",
      "Funnel telemetry is retained for 24 months by default, with shorter retention available on Business and Enterprise plans.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You have the right to access, correct, export, and delete your data. Most of this is self-serve from your dashboard settings. For anything you can't do yourself, email privacy@reevo.io and we respond within 30 days.",
      "EU and UK residents have additional GDPR rights including the right to object to processing and to lodge a complaint with a supervisory authority. California residents have additional CCPA rights including the right to know what we collect and the right to non-discrimination.",
    ],
  },
  {
    title: "Security",
    body: [
      "We are SOC 2 Type II certified. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Access is limited to a small set of authorized personnel and logged.",
      "Our SOC 2 report and security overview are available under NDA from security@reevo.io.",
    ],
  },
  {
    title: "Contact us",
    body: [
      "Privacy questions: privacy@reevo.io",
      "Data Protection Officer: dpo@reevo.io",
      "Mailing address: Reevo Technologies, Inc., 548 Market St, San Francisco, CA 94104, USA.",
    ],
  },
];

type BodyItem = string | { list: string[] };

export default function PrivacyPage() {
  const [active, setActive] = useState(0);
  const refs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 160;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = refs.current[i];
        if (el && el.offsetTop <= y) { setActive(i); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section className="section" style={{ paddingTop: 64, paddingBottom: 32, position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
          <div className="bg-gradients" style={{ opacity: 0.6 }} />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <span className="eyebrow"><span className="dot" /> Legal</span>
            <h1 className="h1" style={{ marginTop: 18, fontSize: "clamp(40px, 5vw, 60px)" }}>Privacy policy</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18, fontSize: 13, color: "var(--muted)", flexWrap: "wrap" }}>
              <span>Last updated: January 12, 2026</span>
              <span>·</span>
              <span>Effective immediately</span>
              <span>·</span>
              <a style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", cursor: "pointer" }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </a>
            </div>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: "64px 0 100px" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 56 }} className="legal-grid">
              {/* Sticky sidebar */}
              <div className="sticky-aside">
                <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", marginBottom: 12, padding: "0 14px" }}>CONTENTS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {SECTIONS.map((s, i) => (
                    <a
                      key={i}
                      onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      style={{
                        cursor: "pointer", padding: "8px 14px", borderRadius: 8,
                        fontSize: 13, fontWeight: active === i ? 500 : 400,
                        color: active === i ? "var(--accent)" : "var(--muted)",
                        background: active === i ? "var(--accent-soft)" : "transparent",
                        borderLeft: `2px solid ${active === i ? "var(--accent)" : "transparent"}`,
                      }}
                    >
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>

              {/* Article */}
              <article style={{ maxWidth: 720 }}>
                {SECTIONS.map((s, i) => (
                  <section
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    style={{ marginBottom: 56, scrollMarginTop: 100 }}
                  >
                    <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h2 style={{ fontSize: 26, letterSpacing: "-0.015em", margin: "6px 0 16px" }}>{s.title}</h2>
                    <div style={{ color: "var(--ink-2)", lineHeight: 1.7, fontSize: 15 }}>
                      {(s.body as BodyItem[]).map((p, j) => {
                        if (typeof p === "string") return <p key={j} style={{ margin: "0 0 14px" }}>{p}</p>;
                        if ("list" in p) return (
                          <ul key={j} style={{ margin: "8px 0 18px", paddingLeft: 20, color: "var(--ink-2)" }}>
                            {p.list.map((li, li_i) => <li key={li_i} style={{ margin: "6px 0" }}>{li}</li>)}
                          </ul>
                        );
                        return null;
                      })}
                    </div>
                  </section>
                ))}
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`@media (max-width: 900px) { .legal-grid { grid-template-columns: 1fr !important; } .legal-grid > div.sticky-aside { position: relative; top: 0; margin-bottom: 32px; } }`}</style>
    </>
  );
}
