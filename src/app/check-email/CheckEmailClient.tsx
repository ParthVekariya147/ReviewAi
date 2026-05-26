"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

const LINK_EXPIRY_SECONDS = 300; // 5 minutes — matches Supabase "Email OTP Expiration" = 300

function fmt(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CheckEmailClient() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [timeLeft, setTimeLeft] = useState(LINK_EXPIRY_SECONDS);
  const [expired, setExpired] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  // Link expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleResend() {
    if (!supabaseConfigured || !email || cooldown > 0) return;
    setResending(true);
    setResendError(null);
    setResendStatus("idle");

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setResendError(error.message);
      setResendStatus("error");
    } else {
      setResendStatus("sent");
      setCooldown(30);
      setTimeLeft(LINK_EXPIRY_SECONDS);
      setExpired(false);
    }
    setResending(false);
  }

  const urgency = timeLeft <= 60 && !expired;
  const timerColor = expired ? "#EF4444" : urgency ? "#F97316" : "var(--muted)";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 420, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: expired ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg, var(--accent), var(--accent-2))",
          display: "grid", placeItems: "center",
          color: expired ? "#EF4444" : "white",
          boxShadow: expired ? "none" : "0 16px 40px -12px color-mix(in oklab, var(--accent) 50%, transparent)",
          transition: "all 0.3s",
        }}>
          {expired ? (
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ) : (
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          )}
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", margin: "0 0 10px" }}>
            {expired ? "Link expired" : "Check your inbox"}
          </h1>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.6, margin: 0 }}>
            {expired
              ? "Your verification link has expired. Request a new one below."
              : <>
                  We sent a verification link to{" "}
                  {email ? <strong style={{ color: "var(--ink)" }}>{email}</strong> : "your email address"}
                  . Click it to activate your account.
                </>
            }
          </p>
        </div>

        {/* Expiry timer */}
        {!expired && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 18px", borderRadius: 999,
            background: urgency ? "rgba(249,115,22,0.08)" : "var(--bg-soft)",
            border: `1px solid ${urgency ? "rgba(249,115,22,0.25)" : "var(--border)"}`,
            transition: "all 0.3s",
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: timerColor, fontVariantNumeric: "tabular-nums" }}>
              Link expires in {fmt(timeLeft)}
            </span>
          </div>
        )}

        {/* Spam hint */}
        {!expired && (
          <div style={{ width: "100%", padding: "16px 20px", background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(110,91,255,0.1)", display: "grid", placeItems: "center", color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>Can&apos;t find the email?</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
                Check your <strong style={{ color: "var(--ink-2)" }}>spam</strong> or <strong style={{ color: "var(--ink-2)" }}>junk</strong> folder. The email comes from Reevo and may take a minute.
              </div>
            </div>
          </div>
        )}

        {/* Resend */}
        <div style={{ width: "100%", textAlign: "center" }}>
          {resendStatus === "sent" && (
            <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(52,168,83,0.08)", border: "1px solid rgba(52,168,83,0.2)", borderRadius: 8, fontSize: 13, color: "#1E7E34" }}>
              New link sent — check your inbox. Valid for 5 minutes.
            </div>
          )}
          {resendStatus === "error" && resendError && (
            <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(213,75,63,0.08)", border: "1px solid rgba(213,75,63,0.2)", borderRadius: 8, fontSize: 13, color: "#B42A1B" }}>
              {resendError}
            </div>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !email}
            style={{
              padding: "10px 22px", borderRadius: 8,
              border: "1px solid var(--border)",
              background: expired ? "var(--accent)" : "none",
              fontSize: 14, fontWeight: 500,
              color: expired ? "white" : cooldown > 0 ? "var(--muted)" : "var(--ink)",
              cursor: cooldown > 0 || resending ? "not-allowed" : "pointer",
              opacity: !email ? 0.4 : 1,
              transition: "all 0.15s",
            }}
          >
            {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
          </button>
        </div>

        {/* Footer links */}
        <div style={{ display: "flex", gap: 20, fontSize: 14 }}>
          <Link href="/signup" style={{ color: "var(--muted)", textDecoration: "none" }}>
            ← Wrong email? Go back
          </Link>
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>
            Sign in instead
          </Link>
        </div>

      </div>
    </div>
  );
}
