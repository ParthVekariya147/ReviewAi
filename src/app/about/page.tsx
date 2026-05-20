import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About — Reevo",
  description: "Reevo was built to help local businesses compete online through authentic, AI-powered Google review generation.",
};

const VALUES = [
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/>
        <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/>
      </svg>
    ),
    title: "AI First",
    body: "We built AI into every layer of the product — from review generation to sentiment analysis to smart, contextual suggestions that customers actually use.",
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: "Customer Obsessed",
    body: "Our success is measured by your reviews. Every feature we build is designed to help you get more five-star ratings with zero extra effort from your team.",
  },
  {
    icon: (
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: "Privacy by Design",
    body: "We never store your customers' personal data. Every scan is anonymized, every AI response is generated fresh, and every request is GDPR & CCPA compliant.",
  },
];

const STATS = [
  { v: "8.4M+", l: "QR scans processed" },
  { v: "1.24M+", l: "Google reviews generated" },
  { v: "92%", l: "5-star review rate" },
  { v: "3,200+", l: "Businesses active" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
            <span className="eyebrow"><span className="dot" /> Our Story</span>
            <h1 className="h1" style={{ marginTop: 18 }}>
              Built for local businesses that deserve to win online.
            </h1>
            <p className="lead" style={{ margin: "20px auto 0", maxWidth: 580 }}>
              Reevo was created after watching countless great small businesses lose customers simply because they didn&apos;t have enough Google reviews — not because they weren&apos;t great at what they did.
            </p>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)", padding: "40px 0", marginTop: 64 }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }} className="stats-grid">
              {STATS.map((s) => (
                <div key={s.v}>
                  <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <span className="eyebrow"><span className="dot" /> Our Values</span>
              <h2 className="h2" style={{ marginTop: 18 }}>What we stand for</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="values-grid">
              {VALUES.map((v) => (
                <div key={v.title} className="card" style={{ padding: 28 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)", marginBottom: 16 }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", margin: "0 0 10px" }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", padding: "80px 0" }}>
          <div className="container" style={{ maxWidth: 680, textAlign: "center" }}>
            <span className="eyebrow"><span className="dot" /> Mission</span>
            <h2 className="h2" style={{ marginTop: 18 }}>
              Every great business deserves to be discovered.
            </h2>
            <p className="lead" style={{ marginTop: 18 }}>
              The internet rewards businesses with reviews, not just quality. We&apos;re leveling the playing field — giving every independent business owner the same review velocity as a franchise with a full marketing team.
            </p>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .values-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
