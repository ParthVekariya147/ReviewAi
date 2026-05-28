"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const BrandMark = ({ size = 28 }: { size?: number }) => (
  <div
    className="brand-mark"
    style={{ width: size, height: size, borderRadius: size * 0.3 }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h7a5 5 0 010 10h-3l5 6"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 4v16"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/industries", label: "Industries" },
  { href: "/about", label: "Company" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <BrandMark size={28} />
          <span>Reevo</span>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={"nav-link" + (pathname === l.href ? " active" : "")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <Link href="/login" className="btn btn-ghost btn-sm nav-right-btn">
            Sign in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm nav-right-btn">
            Start free trial
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
            </svg>
          </Link>
          <button
            className="btn btn-ghost btn-sm nav-menu-btn"
            style={{ padding: 8 }}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {mobileOpen ? (
                <><path d="M6 6l12 12"/><path d="M18 6l-12 12"/></>
              ) : (
                <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — visible on narrow screens via JS toggle */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "8px 20px 16px",
            background: "var(--bg)",
          }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="nav-link"
              style={{ padding: "12px 8px", display: "block" }}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <Link href="/login" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary" style={{ justifyContent: "center" }}>
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
