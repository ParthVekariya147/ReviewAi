import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import IndustriesContent from "./IndustriesContent";

export const metadata: Metadata = {
  title: "Industries — Reevo",
  description:
    "Pre-tuned funnel templates and AI tone presets for restaurants, salons, clinics, gyms, retail, cafés and more.",
};

export default function IndustriesPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section
          className="section"
          style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}
        >
          <div className="bg-gradients" />
          <div
            className="container"
            style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 800, margin: "0 auto" }}
          >
            <span className="eyebrow">
              <span className="dot" /> Industries
            </span>
            <h1 className="h1" style={{ marginTop: 18 }}>
              Templates tuned to{" "}
              <em>every kind of local business.</em>
            </h1>
            <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
              Pick your category. Reevo configures the AI tone, QR placement, and funnel template in one click.
            </p>
          </div>
        </section>

        <IndustriesContent />

        {/* CTA Banner */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <CTABanner />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CTABanner() {
  return (
    <div
      style={{
        borderRadius: 24,
        background: "linear-gradient(135deg, var(--ink) 0%, #2A1F8F 100%)",
        padding: "64px 56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 40,
        position: "relative",
        overflow: "hidden",
        marginBottom: 0,
      }}
      className="cta-inner"
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>
          Get started today
        </div>
        <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 600, letterSpacing: "-0.025em", color: "white", margin: "0 0 12px", lineHeight: 1.15 }}>
          Start collecting reviews in minutes.
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6, maxWidth: 480 }}>
          No credit card required. 14-day free trial. Works with any Google Business profile.
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative" }} className="cta-btns">
        <a href="/signup" className="btn btn-lg" style={{ background: "white", color: "var(--ink)", border: "1px solid white", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          Start free trial
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
          </svg>
        </a>
        <a href="/contact" className="btn btn-ghost btn-lg" style={{ color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.25)", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          Book a demo
        </a>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .cta-inner { flex-direction: column !important; padding: 40px 28px !important; }
          .cta-btns { flex-direction: column !important; width: 100% !important; }
          .cta-btns a { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}
