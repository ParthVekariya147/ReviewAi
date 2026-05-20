import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In — Reevo",
  description: "Sign in to your Reevo account and manage your Google review campaigns.",
};

const BrandMark = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", flexShrink: 0 }}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr" }} className="auth-grid">
      {/* Left panel — form */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", background: "var(--bg)", position: "relative" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", position: "absolute", top: 28, left: 36 }}>
          <BrandMark />
          <span style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>Reevo</span>
        </Link>

        <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px", color: "var(--ink)" }}>Welcome back</h1>
            <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>
              Sign in to your Reevo dashboard.
            </p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--muted)" }}>
            New to Reevo?{" "}
            <Link href="/signup" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — dark marketing side */}
      <div style={{
        position: "relative",
        background: "linear-gradient(135deg, #0A0A14 0%, #1A1538 50%, #2D2070 100%)",
        overflow: "hidden",
        padding: 60,
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }} className="auth-side">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, color-mix(in oklab, var(--accent-2) 60%, transparent), transparent 50%), radial-gradient(circle at 10% 90%, color-mix(in oklab, var(--accent) 50%, transparent), transparent 50%)", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }} />

        <div style={{ position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: 999, color: "white" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "white", boxShadow: "0 0 0 4px rgba(255,255,255,0.2)" }} />
            1,000+ businesses on Reevo
          </span>

          <h2 style={{ fontSize: "clamp(32px, 3.6vw, 44px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.03em", color: "white", margin: "18px 0 18px" }}>
            Turn customer visits into{" "}
            <em style={{ fontStyle: "normal", background: "linear-gradient(110deg, #C8C1FF, #8FC2FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              5★ reviews.
            </em>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.55, maxWidth: 380, margin: "0 0 40px" }}>
            The AI-powered QR funnel that converts happy customers into authentic Google reviews. Used by salons, cafés, clinics, and 1,000+ more local businesses worldwide.
          </p>

          {/* Testimonial card */}
          <div style={{ padding: 24, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, backdropFilter: "blur(20px)" }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {[1,2,3,4,5].map(i => (
                <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                  <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                </svg>
              ))}
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 16px", color: "rgba(255,255,255,0.9)" }}>
              &ldquo;We went from 12 Google reviews a month to 87. The funnel is so smooth our customers actually want to leave a review.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #6ee7b7)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, color: "white", flexShrink: 0 }}>S</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Sofía Reyes</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Owner, Maison Café</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 40, opacity: 0.7, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {[
              { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "SOC 2 Type II" },
              { icon: "M12 22a10 10 0 100-20 10 10 0 000 20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20", label: "GDPR & CCPA" },
              { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", label: "99.99% uptime" },
            ].map((b) => (
              <span key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={b.icon} />
                </svg>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 980px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-side { display: none !important; }
        }
        @media (max-width: 600px) {
          .auth-grid > div:first-child { padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  );
}
