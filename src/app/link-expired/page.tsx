import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Link Expired — Reevo",
};

export default function LinkExpiredPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 420, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, textAlign: "center" }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "grid", placeItems: "center", color: "#EF4444" }}>
          <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", margin: "0 0 12px" }}>
            Link expired
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.65, margin: 0 }}>
            This verification link has expired or has already been used. Email links are valid for 5 minutes.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          <Link
            href="/signup"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px 24px", borderRadius: 10,
              background: "var(--accent)", color: "white",
              fontWeight: 600, fontSize: 15, textDecoration: "none",
              boxShadow: "0 4px 14px -4px color-mix(in oklab, var(--accent) 50%, transparent)",
            }}
          >
            Request a new link
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/login"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "11px 24px", borderRadius: 10,
              border: "1px solid var(--border)", background: "none",
              fontWeight: 500, fontSize: 14, color: "var(--ink)", textDecoration: "none",
            }}
          >
            Sign in instead
          </Link>
        </div>

        <p style={{ fontSize: 13, color: "var(--muted-2)", margin: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
