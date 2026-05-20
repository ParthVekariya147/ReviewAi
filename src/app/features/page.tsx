import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturesGrid from "@/components/home/FeaturesGrid";

export const metadata: Metadata = {
  title: "Features — Reevo",
  description: "Discover how Reevo automates QR review collection, AI suggestion generation, and conversion analytics for local businesses.",
};

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section className="section" style={{ textAlign: "center", paddingBottom: 0 }}>
          <div className="container" style={{ maxWidth: 720, margin: "0 auto" }}>
            <span className="eyebrow"><span className="dot" /> All Features</span>
            <h1 className="h1" style={{ marginTop: 18 }}>
              Powerful tools to master
              <br />
              <em style={{ background: "linear-gradient(110deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", fontStyle: "normal" }}>
                your reputation.
              </em>
            </h1>
            <p className="lead" style={{ margin: "20px auto 0", maxWidth: 560 }}>
              Reevo automates every step — from the QR scan to the Google review — so you can focus on running your business, not chasing feedback.
            </p>
            <div className="row" style={{ justifyContent: "center", gap: 12, marginTop: 32 }}>
              <Link href="/signup" className="btn btn-accent btn-lg">
                Start free trial
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/pricing" className="btn btn-ghost btn-lg">View pricing</Link>
            </div>
          </div>
        </section>

        <FeaturesGrid />

        {/* Bottom CTA */}
        <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: 560 }}>
            <span className="eyebrow"><span className="dot" /> Ready to start?</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Everything you need, none of the complexity.</h2>
            <p className="lead" style={{ margin: "16px auto 28px" }}>Get set up in 3 minutes. Free plan available — no credit card required.</p>
            <Link href="/signup" className="btn btn-accent btn-lg">
              Create free account
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
