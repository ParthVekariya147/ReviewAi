"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const SECTIONS = [
  {
    title: "Acceptance",
    body: [
      "By creating a Reevo account or using the Reevo service, you agree to these Terms of Service (\"Terms\"). If you don't agree, you can't use the service.",
      "These Terms apply to any individual or business using Reevo. If you're using Reevo on behalf of a company, you confirm you have authority to bind that company to these Terms.",
    ],
  },
  {
    title: "The service",
    body: [
      "Reevo provides a software platform that helps businesses request and convert authentic Google reviews from their real customers via QR-based mobile funnels, AI-assisted review suggestions, and conversion analytics.",
      "Reevo does not write fake reviews. The platform helps real customers draft and post their own authentic reviews to their own Google accounts. Every review collected via Reevo is the work of a real person.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "You agree to use Reevo in a way that complies with Google's review content policies and any applicable consumer protection laws. Specifically, you will not:",
      {
        list: [
          "Use Reevo to incentivize, bribe, or compensate customers for posting reviews",
          "Use Reevo to write or submit reviews on behalf of customers (the customer is always the author)",
          "Use Reevo to selectively hide negative reviews from Google (\"review-gating\")",
          "Use Reevo to collect reviews from non-customers or fabricate customer interactions",
          "Reverse-engineer, scrape, or abuse the Reevo platform or its underlying AI",
        ],
      },
      "Violation of acceptable use is grounds for immediate account termination without refund.",
    ],
  },
  {
    title: "Accounts",
    body: [
      "You're responsible for your account credentials and for any activity that occurs under your account. Use a strong password and don't share it. Tell us immediately if you suspect unauthorized access.",
    ],
  },
  {
    title: "Subscription & billing",
    body: [
      "Paid plans are billed monthly or annually in advance. All fees are non-refundable except as required by law or as expressly stated in these Terms.",
      "We offer a 30-day money-back guarantee on any new paid subscription. Email billing@reevo.io within 30 days of your first charge to receive a full refund.",
      "We may change pricing at any time. Existing subscribers are notified at least 30 days before renewal at a new price.",
      "Cancellation can be done anytime from your dashboard. Cancellation takes effect at the end of the current billing period.",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "Reevo retains all rights to the Reevo platform, software, design, and brand. Your content (campaigns, branding assets, customer data) remains yours.",
      "By submitting content to Reevo, you grant us a worldwide, non-exclusive license to host, process, and display that content as needed to operate the service for you.",
    ],
  },
  {
    title: "Disclaimer of warranties",
    body: [
      "The service is provided \"as is\" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or that any specific result (such as a number of reviews) will be achieved.",
      "Review velocity depends on factors outside our control (your customer volume, the quality of your service, your QR placement, Google's policies, etc.) and we make no specific guarantees about outcomes.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "To the maximum extent permitted by law, Reevo's total liability for any claim arising out of or relating to these Terms or the service is limited to the amount you paid Reevo in the 12 months prior to the event giving rise to the claim.",
      "Reevo is not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits or lost data, even if advised of the possibility.",
    ],
  },
  {
    title: "Termination",
    body: [
      "You can terminate your account anytime by canceling in the dashboard. We may terminate your account if you violate these Terms, fail to pay, or engage in activity that harms the service or other users.",
      "Upon termination, your right to use the service ends immediately. We retain certain data per the Privacy Policy.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These Terms are governed by the laws of the State of California, USA, without regard to conflicts of law principles. Disputes will be resolved in the courts located in San Francisco County, California.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "We may update these Terms from time to time. Material changes are emailed to account owners at least 30 days before taking effect. Continued use of the service after changes take effect constitutes acceptance.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these Terms: legal@reevo.io",
      "Reevo Technologies, Inc., 548 Market St, San Francisco, CA 94104, USA.",
    ],
  },
];

type BodyItem = string | { list: string[] };

export default function TermsPage() {
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
            <h1 className="h1" style={{ marginTop: 18, fontSize: "clamp(40px, 5vw, 60px)" }}>Terms of service</h1>
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
