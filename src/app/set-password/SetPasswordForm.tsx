"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= score ? colors[score] : "var(--border)", transition: "background 0.2s" }} />
        ))}
      </div>
      {score > 0 && <span style={{ fontSize: 11, color: colors[score], fontWeight: 500 }}>{labels[score]}</span>}
    </div>
  );
}

export default function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) { setChecking(false); return; }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/login");
      else setChecking(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (!supabaseConfigured) { setError("Auth is not configured. Add your Supabase credentials to .env.local."); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { has_password: true },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/app/business_dashboard/onboarding"), 1800);
  }

  if (checking) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, padding: "12px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 12px 30px -10px rgba(52,168,83,0.45)" }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Password set!</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
            Setting up your account…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--accent-soft, rgba(110,91,255,0.1))", display: "grid", placeItems: "center", color: "var(--accent)", marginBottom: 20 }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--ink)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Set a password
        </h1>
        <p style={{ fontSize: 15, color: "var(--muted)", margin: 0, lineHeight: 1.55 }}>
          Create a password so you can also sign in without Google in the future.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={{ padding: "10px 12px", background: "rgba(213,75,63,0.08)", border: "1px solid rgba(213,75,63,0.2)", borderRadius: 8, color: "#B42A1B", fontSize: 13 }}>
            {error}
          </div>
        )}

        <div>
          <label className="label" htmlFor="password">New password</label>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className="input"
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, padding: 6, color: "var(--muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <StrengthBar password={password} />
        </div>

        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type={showPw ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className={`input${confirm && confirm !== password ? " error" : ""}`}
          />
          {confirm && confirm !== password && (
            <div className="err-msg">Passwords don&apos;t match.</div>
          )}
          {confirm && confirm === password && password.length >= 8 && (
            <div style={{ fontSize: 12, color: "#22C55E", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              Passwords match
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!!confirm && confirm !== password)}
          className="btn btn-primary btn-lg"
          style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Saving…
            </>
          ) : (
            <>
              Set password &amp; continue
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M13 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
