"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import GoogleAuthButton from "./GoogleAuthButton";

const INDUSTRIES = [
  { id: "restaurants", label: "Restaurant", icon: "🍽️" },
  { id: "salons", label: "Salon", icon: "💇" },
  { id: "clinics", label: "Clinic", icon: "🩺" },
  { id: "cafes", label: "Café", icon: "☕" },
  { id: "gyms", label: "Gym", icon: "🏋️" },
  { id: "retail", label: "Retail", icon: "🛍️" },
  { id: "drycleaners", label: "Dry cleaner", icon: "👔" },
  { id: "services", label: "Service biz", icon: "🛠️" },
];

const TOTAL_STEPS = 4;

interface FormState {
  fullName: string;
  email: string;
  password: string;
  business: string;
  locations: string | number;
  industry: string;
  googleLink: string;
}

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    fullName: "", email: "", password: "",
    business: "", locations: 1,
    industry: "", googleLink: "",
  });
  const [errs, setErrs] = useState<Partial<Record<keyof FormState, string>>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/app/business_dashboard/onboarding');
      }
    });
  }, [router]);

  function patch(key: keyof FormState, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrs((e) => ({ ...e, [key]: undefined }));
  }

  async function next() {
    const e: Partial<Record<keyof FormState, string>> = {};
    setSubmitError(null);

    if (step === 0) {
      if (!form.fullName.trim()) e.fullName = "Required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email please.";
      if (form.password.length < 8) e.password = "8+ characters.";
    }
    if (step === 1) {
      if (!form.business.trim()) e.business = "Required.";
    }
    if (step === 2 && !form.industry) e.industry = "Pick one.";

    setErrs(e);
    if (Object.keys(e).length) return;

    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final step — submit
    if (!supabaseConfigured) {
      setSubmitError("Auth not configured. Add Supabase credentials to .env.local.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          business_name: form.business,
          industry: form.industry,
          locations: form.locations,
          google_link: form.googleLink,
          role: "user",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setSubmitError(error.message);
      setLoading(false);
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setSubmitError("already_exists");
      setLoading(false);
      return;
    }

    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18, padding: "20px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 16px 40px -12px rgba(52,168,83,0.45)" }}>
          <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            You&apos;re in! 🎉
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 360, lineHeight: 1.55, margin: 0 }}>
            Welcome to Reevo, {form.fullName.split(" ")[0]}. We&apos;ve sent a confirmation link to{" "}
            <strong style={{ color: "var(--ink)" }}>{form.email}</strong>. Click it to activate your account.
          </p>
        </div>
        <div style={{ padding: 16, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, display: "flex", gap: 12, alignItems: "center", width: "100%", maxWidth: 380 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white", flexShrink: 0 }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Check your inbox</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Confirm your email to start your 14-day trial.</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted-2)", margin: 0 }}>
          Already confirmed?{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {Math.round(((step + 1) / TOTAL_STEPS) * 100)}% complete
          </span>
        </div>
        <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-2))", borderRadius: 999, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* Step 0: Account */}
      {step === 0 && (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Create your account</h1>
          <p style={{ color: "var(--muted)", margin: "0 0 24px", fontSize: 15 }}>14-day free trial. No credit card.</p>

          <GoogleAuthButton label="Sign up with Google" />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input id="fullName" className={`input${errs.fullName ? " error" : ""}`} value={form.fullName} onChange={(e) => patch("fullName", e.target.value)} placeholder="Jane Doe" autoComplete="name" />
              {errs.fullName && <div className="err-msg">{errs.fullName}</div>}
            </div>
            <div>
              <label className="label" htmlFor="email">Work email</label>
              <input id="email" type="email" className={`input${errs.email ? " error" : ""}`} value={form.email} onChange={(e) => patch("email", e.target.value)} placeholder="jane@yourbiz.com" autoComplete="email" />
              {errs.email && <div className="err-msg">{errs.email}</div>}
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className={`input${errs.password ? " error" : ""}`} value={form.password} onChange={(e) => patch("password", e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
              {errs.password && <div className="err-msg">{errs.password}</div>}
              {!errs.password && <div className="helper">Must be 8+ characters with a number.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Business */}
      {step === 1 && (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>About your business</h1>
          <p style={{ color: "var(--muted)", margin: "0 0 24px", fontSize: 15 }}>So we can configure your funnel.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" htmlFor="business">Business name</label>
              <input id="business" className={`input${errs.business ? " error" : ""}`} value={form.business} onChange={(e) => patch("business", e.target.value)} placeholder="Maison Café" />
              {errs.business && <div className="err-msg">{errs.business}</div>}
            </div>
            <div>
              <label className="label">How many locations?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {([1, 2, "3–10", "10+"] as (number | string)[]).map((opt) => (
                  <button
                    key={String(opt)}
                    type="button"
                    onClick={() => patch("locations", opt as number | string)}
                    style={{
                      padding: "10px 16px", borderRadius: 999, cursor: "pointer",
                      background: String(form.locations) === String(opt) ? "var(--ink)" : "var(--surface)",
                      color: String(form.locations) === String(opt) ? "var(--bg)" : "var(--ink-2)",
                      border: `1px solid ${String(form.locations) === String(opt) ? "var(--ink)" : "var(--border)"}`,
                      fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Industry */}
      {step === 2 && (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Pick your industry</h1>
          <p style={{ color: "var(--muted)", margin: "0 0 20px", fontSize: 15 }}>We&apos;ll set up a template tuned for you.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => patch("industry", ind.id)}
                style={{
                  padding: "16px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 12,
                  background: form.industry === ind.id ? "var(--accent-soft)" : "var(--surface)",
                  color: form.industry === ind.id ? "var(--accent-ink)" : "var(--ink-2)",
                  border: `1.5px solid ${form.industry === ind.id ? "var(--accent)" : "var(--border)"}`,
                  fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 22 }}>{ind.icon}</span>
                {ind.label}
              </button>
            ))}
          </div>
          {errs.industry && <div className="err-msg" style={{ marginTop: 10 }}>{errs.industry}</div>}
        </div>
      )}

      {/* Step 3: Google profile */}
      {step === 3 && (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 4px" }}>Connect your Google profile</h1>
          <p style={{ color: "var(--muted)", margin: "0 0 24px", fontSize: 15 }}>So we can route customers to your real review page.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="label" htmlFor="googleLink">Google Business profile link</label>
              <input
                id="googleLink"
                className="input"
                value={form.googleLink}
                onChange={(e) => patch("googleLink", e.target.value)}
                placeholder="https://g.page/r/your-business-id"
              />
              <div className="helper">Paste your Google review link. Optional — you can add this later.</div>
            </div>

            <div style={{ padding: 16, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.4H19l-4.6 3.4 1.8 5.4L12 14l-4.2 3.2 1.8-5.4L5 8.4h5.2z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Your first QR is ready</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 }}>
                  We&apos;ll generate it as soon as you create your account and show it in your dashboard.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit error (shown at bottom, visible on any step) */}
      {submitError && (
        <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--bg-soft)", border: "1px solid var(--danger, #ef4444)", borderRadius: 10, fontSize: 13, color: "var(--danger, #ef4444)" }}>
          {submitError === "already_exists" ? (
            <>An account with this email already exists. <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Sign in instead</Link></>
          ) : submitError}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        {step > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep((s) => s - 1)}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={next}
          disabled={loading}
          style={{ flex: step > 0 ? 2 : 1, width: step === 0 ? "100%" : undefined, justifyContent: "center", opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Creating workspace…
            </>
          ) : step === TOTAL_STEPS - 1 ? (
            <>
              Create my account
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
            </>
          ) : (
            <>
              Continue
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
            </>
          )}
        </button>
      </div>

      {step === 0 && (
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </p>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
