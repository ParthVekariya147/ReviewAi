import type { Metadata } from "next";
import Link from "next/link";
import SetPasswordForm from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "Set a Password — Reevo",
};

const BrandMark = () => (
  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", flexShrink: 0 }}>
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

export default function SetPasswordPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "var(--bg)", padding: "60px 24px", position: "relative" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", position: "absolute", top: 28, left: 36 }}>
        <BrandMark />
        <span style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.02em" }}>Reevo</span>
      </Link>

      <div style={{ maxWidth: 420, width: "100%" }}>
        <SetPasswordForm />
      </div>
    </div>
  );
}
