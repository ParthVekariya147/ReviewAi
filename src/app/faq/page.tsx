import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FAQAccordion from "@/components/home/FAQAccordion";

export const metadata: Metadata = {
  title: "FAQ — Reevo",
  description: "Frequently asked questions about Reevo — the AI-powered QR review platform.",
};

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 56px" }}>
              <span className="eyebrow"><span className="dot" /> FAQ</span>
              <h1 className="h1" style={{ marginTop: 18 }}>Frequently Asked Questions</h1>
              <p className="lead" style={{ margin: "16px auto 0" }}>
                Everything you need to know about Reevo. Can&apos;t find an answer?{" "}
                <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Contact us →</Link>
              </p>
            </div>
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <FAQAccordion />
            </div>

            {/* CTA */}
            <div style={{ maxWidth: 720, margin: "48px auto 0", textAlign: "center" }}>
              <div className="card" style={{ padding: "32px 40px", background: "var(--accent-soft)", border: "1px solid rgba(110,91,255,0.15)" }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Still have questions?</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 20px" }}>Our support team is here to help — usually within a few hours.</p>
                <Link href="/contact" className="btn btn-accent">
                  Contact support
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
