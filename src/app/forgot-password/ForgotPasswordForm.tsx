"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!supabaseConfigured) {
      setError("Auth is not configured. Add your Supabase credentials to .env.local.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, padding: "8px 0" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white", boxShadow: "0 12px 30px -10px color-mix(in oklab, var(--accent) 50%, transparent)" }}>
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>Check your inbox</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.65 }}>
            We sent a password reset link to{" "}
            <strong style={{ color: "var(--ink)" }}>{email}</strong>.
            {" "}The link expires in 5 minutes.
          </p>
        </div>
        <div style={{ padding: "14px 20px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
          Didn&apos;t receive it? Check your spam folder, or{" "}
          <button
            onClick={() => { setSent(false); setError(null); }}
            style={{ all: "unset", color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}
          >
            try again
          </button>.
        </div>
        <Link href="/login" style={{ fontSize: 14, color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
          Return to sign in →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)", marginBottom: 18 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Reset your password</h1>
        <p style={{ fontSize: 15, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{ padding: "10px 12px", background: "rgba(213,75,63,0.08)", border: "1px solid rgba(213,75,63,0.2)", borderRadius: 8, color: "#B42A1B", fontSize: 13 }}>
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@yourbiz.com"
            autoComplete="email"
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="M13 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
