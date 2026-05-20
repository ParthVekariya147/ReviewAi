import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password — Reevo",
  description: "Reset your Reevo account password.",
};

const BrandMark = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", flexShrink: 0 }}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr" }} className="auth-grid">
      {/* Left — form */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 72px", background: "var(--bg)", position: "relative" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", position: "absolute", top: 28, left: 36 }}>
          <BrandMark />
          <span style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>Reevo</span>
        </Link>

        <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 32 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            Back to sign in
          </Link>

          <ForgotPasswordForm />
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "clamp(28px, 3.2vw, 38px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.03em", color: "white", margin: "0 0 16px" }}>
            Secure password reset,{" "}
            <em style={{ fontStyle: "normal", background: "linear-gradient(110deg, #C8C1FF, #8FC2FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              in seconds.
            </em>
          </h2>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 360, margin: "0 0 40px" }}>
            Enter your email and we&apos;ll send a secure reset link. It expires in 1 hour for your protection.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "End-to-end encrypted reset link" },
              { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", label: "Expires in 60 minutes automatically" },
              { icon: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.25 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.14a16 16 0 006 6l1.27-.64a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z", label: "Works with Google-linked accounts too" },
            ].map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={b.icon} />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.45 }}>{b.label}</span>
              </div>
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
