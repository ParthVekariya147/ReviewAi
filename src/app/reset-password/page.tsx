import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Set New Password — Reevo",
  description: "Choose a new password for your Reevo account.",
};

const BrandMark = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", flexShrink: 0 }}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr" }} className="auth-grid">
      {/* Left — form */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", background: "var(--bg)", position: "relative" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", position: "absolute", top: 28, left: 36 }}>
          <BrandMark />
          <span style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>Reevo</span>
        </Link>

        <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
          <ResetPasswordForm />
        </div>
      </div>

      {/* Right — dark side */}
      <div style={{
        position: "relative", background: "linear-gradient(135deg, #0A0A14 0%, #1A1538 50%, #2D2070 100%)",
        overflow: "hidden", padding: 60, color: "white",
        display: "flex", flexDirection: "column", justifyContent: "center",
      }} className="auth-side">
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, color-mix(in oklab, var(--accent-2) 60%, transparent), transparent 50%), radial-gradient(circle at 10% 90%, color-mix(in oklab, var(--accent) 50%, transparent), transparent 50%)", opacity: 0.6 }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }} />

        <div style={{ position: "relative" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "grid", placeItems: "center", marginBottom: 28, backdropFilter: "blur(12px)" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 3.2vw, 38px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.03em", color: "white", margin: "0 0 16px" }}>
            Almost there —{" "}
            <em style={{ fontStyle: "normal", background: "linear-gradient(110deg, #C8C1FF, #8FC2FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              new password set.
            </em>
          </h2>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 360, margin: "0 0 40px" }}>
            Choose a strong, unique password. Once saved you&apos;ll be taken straight to your dashboard.
          </p>

          <div style={{ padding: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, backdropFilter: "blur(20px)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Password tips
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Use 10+ characters",
                "Mix letters, numbers & symbols",
                "Never reuse a password",
                "Don't use personal info",
              ].map((tip) => (
                <div key={tip} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>{tip}</span>
                </div>
              ))}
            </div>
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
