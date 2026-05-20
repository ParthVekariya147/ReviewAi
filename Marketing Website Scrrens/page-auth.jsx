/* global React, Icon, BrandMark, QRPattern, Stars, Avatar */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
/* ============================================================
   AuthShell: split-screen with marketing side
   ============================================================ */
const AuthShell = ({ children, side }) => (
  <div style={{ minHeight: "calc(100vh - 80px)", display: "grid", gridTemplateColumns: "1.1fr 1fr" }} className="auth-grid">
    <div style={{ padding: "60px 60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {children}
    </div>
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
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }} />
      <div style={{ position: "relative" }}>{side}</div>
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

const AuthSideContent = () => (
  <div>
    <span className="eyebrow" style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
      <span className="dot" style={{ background: "white", boxShadow: "0 0 0 4px rgba(255,255,255,0.2)" }}/>
      1,000+ businesses on Reevo
    </span>
    <h2 className="h1" style={{ color: "white", marginTop: 18, fontSize: "clamp(32px, 3.6vw, 44px)" }}>
      Turn customer visits into <em style={{ background: "linear-gradient(110deg, #C8C1FF, #8FC2FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>5★ reviews.</em>
    </h2>
    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 18, maxWidth: 380, lineHeight: 1.55 }}>
      The AI-powered QR funnel that converts happy customers into authentic Google reviews. Used by salons, cafés, clinics, and 1,000+ more local businesses worldwide.
    </p>

    <div className="card" style={{ marginTop: 40, padding: 24, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", backdropFilter: "blur(20px)" }}>
      <Stars value={5} size={14} />
      <p style={{ fontSize: 15, lineHeight: 1.55, marginTop: 10, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>
        "We went from 12 Google reviews a month to 87. The funnel is so smooth our customers actually want to leave a review."
      </p>
      <div className="row" style={{ gap: 10 }}>
        <Avatar name="Sofía Reyes" size={36} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Sofía Reyes</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Owner, Maison Café</div>
        </div>
      </div>
    </div>

    <div className="row" style={{ gap: 24, marginTop: 40, opacity: 0.7, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
      <span className="row" style={{ gap: 6 }}><Icon name="shield" size={13} /> SOC 2 Type II</span>
      <span className="row" style={{ gap: 6 }}><Icon name="globe" size={13} /> GDPR & CCPA</span>
      <span className="row" style={{ gap: 6 }}><Icon name="bolt" size={13} /> 99.99% uptime</span>
    </div>
  </div>
);

/* ============================================================
   Login Page
   ============================================================ */
const LoginPage = ({ navigate }) => {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErr("Please enter a valid email.");
    if (form.password.length < 1) return setErr("Enter your password.");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setErr("Demo only — try signup to see the full flow.");
    }, 800);
  };

  return (
    <div data-screen-label="08 Login">
      <AuthShell side={<AuthSideContent />}>
        <div style={{ maxWidth: 380, margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, letterSpacing: "-0.02em", margin: 0 }}>Welcome back</h1>
            <p style={{ color: "var(--muted)", margin: "8px 0 0", fontSize: 15 }}>
              Sign in to your Reevo dashboard.
            </p>
          </div>

          <button className="btn btn-ghost btn-lg" style={{ width: "100%", justifyContent: "center", gap: 10 }}>
            <Icon name="google" size={16} /> Continue with Google
          </button>

          <div className="row" style={{ gap: 12, margin: "20px 0", alignItems: "center" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>or with email</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <form onSubmit={submit} className="col" style={{ gap: 14 }}>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@yourbiz.com" autoComplete="email" />
            </div>
            <div>
              <div className="between" style={{ marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>Password</label>
                <a style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer" }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input className="input" type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" autoComplete="current-password" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: 0, padding: 6, color: "var(--muted)", cursor: "pointer" }}>
                  <Icon name="eye" size={15} />
                </button>
              </div>
            </div>
            <label className="row" style={{ gap: 8, fontSize: 13, color: "var(--ink-2)", cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} style={{ accentColor: "var(--accent)" }} />
              Remember me for 30 days
            </label>
            {err && <div style={{ padding: "10px 12px", background: "rgba(213,75,63,0.08)", border: "1px solid rgba(213,75,63,0.2)", borderRadius: 8, color: "#B42A1B", fontSize: 13 }}>{err}</div>}
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
              {submitting ? <><span className="spinner" /> Signing in…</> : <>Sign in <Icon name="arrow" size={14} /></>}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 14, color: "var(--muted)" }}>
            New to Reevo? <a onClick={() => navigate("signup")} style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}>Create an account</a>
          </p>
        </div>
      </AuthShell>
    </div>
  );
};

/* ============================================================
   Signup Page — multi-step onboarding
   ============================================================ */
const ONBOARDING_INDUSTRIES = [
  { id: "restaurants", label: "Restaurant", icon: "🍽️" },
  { id: "salons", label: "Salon", icon: "💇" },
  { id: "clinics", label: "Clinic", icon: "🩺" },
  { id: "cafes", label: "Café", icon: "☕" },
  { id: "gyms", label: "Gym", icon: "🏋️" },
  { id: "retail", label: "Retail", icon: "🛍️" },
  { id: "drycleaners", label: "Dry cleaner", icon: "👔" },
  { id: "services", label: "Service biz", icon: "🛠️" },
];

const SignupPage = ({ navigate }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: "", email: "", password: "",
    business: "", industry: "", googleLink: "",
    locations: 1,
  });
  const [errs, setErrs] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 4;
  const next = () => {
    const e = {};
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
    if (step === totalSteps - 1) {
      setSubmitting(true);
      setTimeout(() => { setSubmitting(false); setStep(totalSteps); }, 1200);
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div data-screen-label="09 Signup">
      <AuthShell side={<AuthSideContent />}>
        <div style={{ maxWidth: 440, margin: "0 auto", width: "100%" }}>
          {step < totalSteps ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <div className="between" style={{ marginBottom: 12 }}>
                  <span className="kicker">STEP {step + 1} OF {totalSteps}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{Math.round(((step + 1) / totalSteps) * 100)}% complete</span>
                </div>
                <div className="progress"><span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
              </div>

              {step === 0 && (
                <div className="fade-up">
                  <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>Create your account</h1>
                  <p style={{ color: "var(--muted)", margin: "8px 0 24px", fontSize: 15 }}>14-day free trial. No credit card.</p>

                  <button className="btn btn-ghost btn-lg" style={{ width: "100%", justifyContent: "center", gap: 10 }}>
                    <Icon name="google" size={16} /> Sign up with Google
                  </button>
                  <div className="row" style={{ gap: 12, margin: "18px 0", alignItems: "center" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>or with email</span>
                    <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                  </div>

                  <div className="col" style={{ gap: 14 }}>
                    <div>
                      <label className="label">Full name</label>
                      <input className={"input" + (errs.fullName ? " error" : "")} value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Jane Doe" />
                      {errs.fullName && <div className="err-msg">{errs.fullName}</div>}
                    </div>
                    <div>
                      <label className="label">Work email</label>
                      <input className={"input" + (errs.email ? " error" : "")} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@yourbiz.com" />
                      {errs.email && <div className="err-msg">{errs.email}</div>}
                    </div>
                    <div>
                      <label className="label">Password</label>
                      <input className={"input" + (errs.password ? " error" : "")} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
                      {errs.password && <div className="err-msg">{errs.password}</div>}
                      <div className="helper">Must be 8+ characters with a number.</div>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="fade-up">
                  <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>About your business</h1>
                  <p style={{ color: "var(--muted)", margin: "8px 0 24px", fontSize: 15 }}>So we can configure your funnel.</p>
                  <div className="col" style={{ gap: 14 }}>
                    <div>
                      <label className="label">Business name</label>
                      <input className={"input" + (errs.business ? " error" : "")} value={form.business} onChange={e => setForm({ ...form, business: e.target.value })} placeholder="Maison Café" />
                      {errs.business && <div className="err-msg">{errs.business}</div>}
                    </div>
                    <div>
                      <label className="label">How many locations?</label>
                      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                        {[1, 2, "3–10", "10+"].map((opt, i) => (
                          <button key={i} type="button" onClick={() => setForm({ ...form, locations: opt })} style={{
                            padding: "10px 16px", borderRadius: 999, cursor: "pointer",
                            background: String(form.locations) === String(opt) ? "var(--ink)" : "var(--surface)",
                            color: String(form.locations) === String(opt) ? "var(--bg)" : "var(--ink-2)",
                            border: "1px solid " + (String(form.locations) === String(opt) ? "var(--ink)" : "var(--border)"),
                            fontSize: 14, fontWeight: 500,
                          }}>{opt}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="fade-up">
                  <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>Pick your industry</h1>
                  <p style={{ color: "var(--muted)", margin: "8px 0 20px", fontSize: 15 }}>We'll set up a template tuned for you.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {ONBOARDING_INDUSTRIES.map(ind => (
                      <button key={ind.id} type="button" onClick={() => setForm({ ...form, industry: ind.id })} style={{
                        padding: "16px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                        background: form.industry === ind.id ? "var(--accent-soft)" : "var(--surface)",
                        color: form.industry === ind.id ? "var(--accent-ink)" : "var(--ink-2)",
                        border: "1.5px solid " + (form.industry === ind.id ? "var(--accent)" : "var(--border)"),
                        fontSize: 14, fontWeight: 500,
                        transition: "all .15s",
                      }}>
                        <span style={{ fontSize: 22 }}>{ind.icon}</span> {ind.label}
                      </button>
                    ))}
                  </div>
                  {errs.industry && <div className="err-msg" style={{ marginTop: 10 }}>{errs.industry}</div>}
                </div>
              )}

              {step === 3 && (
                <div className="fade-up">
                  <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>Connect your Google profile</h1>
                  <p style={{ color: "var(--muted)", margin: "8px 0 24px", fontSize: 15 }}>So we can route customers to your real review page.</p>
                  <div className="col" style={{ gap: 14 }}>
                    <div>
                      <label className="label">Google Business profile link</label>
                      <input className="input" value={form.googleLink} onChange={e => setForm({ ...form, googleLink: e.target.value })} placeholder="https://g.page/r/your-business-id" />
                      <div className="helper">Paste your Google review link. We'll preview it in the dashboard. Optional — you can add this later.</div>
                    </div>
                    <div className="card" style={{ padding: 16, background: "var(--bg-soft)" }}>
                      <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", display: "grid", placeItems: "center" }}>
                          <Icon name="sparkles" size={15} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>Your first QR is ready</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>We'll show it on the next screen.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="row" style={{ gap: 10, marginTop: 28 }}>
                {step > 0 && (
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(s => s - 1)} style={{ flex: 1, justifyContent: "center" }}>Back</button>
                )}
                <button type="button" className="btn btn-primary btn-lg" onClick={next} disabled={submitting} style={{ flex: 2, justifyContent: "center" }}>
                  {submitting ? <><span className="spinner" /> Creating workspace…</> :
                    step === totalSteps - 1 ? <>Create my account <Icon name="arrow" size={14} /></> :
                    <>Continue <Icon name="arrow" size={14} /></>}
                </button>
              </div>

              {step === 0 && (
                <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
                  Already have an account? <a onClick={() => navigate("login")} style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}>Sign in</a>
                </p>
              )}
            </>
          ) : (
            <div className="fade-up col" style={{ alignItems: "center", textAlign: "center", gap: 18, padding: "20px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 16px 40px -12px rgba(52,168,83,0.45)" }}>
                <Icon name="check" size={30} stroke={2.5} />
              </div>
              <h1 style={{ fontSize: 28, letterSpacing: "-0.02em", margin: 0 }}>You're in! 🎉</h1>
              <p style={{ color: "var(--muted)", maxWidth: 360, lineHeight: 1.55 }}>
                Welcome to Reevo, {form.fullName.split(" ")[0]}. We've set up <strong>{form.business}</strong> with your first QR code below — print it and start collecting reviews tonight.
              </p>

              <div className="card" style={{ padding: 24, background: "var(--bg-soft)", display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ padding: 8, background: "white", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <QRPattern size={110} label={form.business} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div className="kicker">YOUR FIRST QR</div>
                  <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>{form.business} — Default</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>reevo.io/r/{form.business.toLowerCase().split(" ").join("-")}</div>
                  <button className="btn btn-sm btn-ghost" style={{ marginTop: 12 }}>
                    <Icon name="download" size={12} /> Download QR
                  </button>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>
                Open my dashboard <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
        </div>
      </AuthShell>
    </div>
  );
};

Object.assign(window, { LoginPage, SignupPage });
