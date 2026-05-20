import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const COMING_FEATURES = [
  { icon: "🎯", label: "Funnel Manager", desc: "Build & manage QR review funnels" },
  { icon: "📱", label: "QR Dashboard", desc: "Generate, track, and print QR codes" },
  { icon: "📊", label: "Analytics", desc: "Scan rates, conversion funnels, heatmaps" },
  { icon: "🌟", label: "AI Review Engine", desc: "Gemini-powered review suggestions" },
  { icon: "💳", label: "Billing & Plans", desc: "Manage your subscription" },
  { icon: "⚙️", label: "Settings", desc: "Branding, notifications, integrations" },
];

function Avatar({ name, email }: { name: string; email: string }) {
  const initials = name !== email
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email[0].toUpperCase();

  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
      display: "grid", placeItems: "center",
      fontSize: 22, fontWeight: 700, color: "white",
      boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--accent) 60%, transparent), 0 0 0 4px color-mix(in oklab, var(--accent) 16%, transparent)",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default async function BusinessDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/app/business_dashboard");

  const fullName: string = user.user_metadata?.full_name || "";
  const email: string = user.email ?? "";
  const displayName = fullName || email.split("@")[0];
  const firstName = displayName.split(" ")[0];
  const role: string = user.user_metadata?.role || "business_owner";
  const roleLabel = role === "admin" ? "Admin" : "Business Owner";
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>

      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", width: 700, height: 700,
          left: "50%", top: "50%", transform: "translate(-60%, -55%)",
          background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 28%, transparent), transparent 70%)",
          filter: "blur(80px)", opacity: 0.6,
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500,
          right: "-10%", bottom: "10%",
          background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent-2) 25%, transparent), transparent 70%)",
          filter: "blur(80px)", opacity: 0.5,
        }} />
        {/* Grid dots */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, color-mix(in oklab, var(--ink) 9%, transparent) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 80%)",
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in oklab, var(--bg) 80%, transparent)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>Reevo</span>
          <span style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }} />
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Business Dashboard</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: "var(--accent-soft)",
            border: "1px solid color-mix(in oklab, var(--accent) 25%, transparent)",
            fontSize: 12, fontWeight: 500, color: "var(--accent-ink)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)" }} />
            {roleLabel}
          </span>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                background: "transparent", border: "1px solid var(--border)",
                fontSize: 13, color: "var(--muted)", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "calc(100vh - 65px)",
        padding: "60px 24px",
      }}>
        {/* User card */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 16, marginBottom: 48, textAlign: "center",
        }}>
          <Avatar name={fullName || email} email={email} />
          <div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Welcome back
            </div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 600, letterSpacing: "-0.03em", margin: 0, color: "var(--ink)", lineHeight: 1.1 }}>
              Hey {firstName}! 👋
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999,
                background: "var(--surface)", border: "1px solid var(--border)",
                fontSize: 13, color: "var(--ink-2)",
              }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {email}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999,
                background: "var(--accent-soft)",
                border: "1px solid color-mix(in oklab, var(--accent) 25%, transparent)",
                fontSize: 13, fontWeight: 500, color: "var(--accent-ink)",
              }}>
                {roleLabel}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 999,
                background: "var(--surface)", border: "1px solid var(--border)",
                fontSize: 13, color: "var(--muted)",
              }}>
                Member since {joinedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Coming soon card */}
        <div style={{
          maxWidth: 680, width: "100%",
          padding: "48px 52px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          boxShadow: "0 32px 80px -24px color-mix(in oklab, var(--accent) 18%, transparent), 0 8px 24px -8px rgba(15,15,30,0.08)",
          textAlign: "center",
        }}>
          {/* Pulsing indicator */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 999,
              background: "var(--accent-soft)",
              border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--accent)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)", animation: "pulse 2s ease infinite" }} />
              In Active Development
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 600,
            letterSpacing: "-0.025em", lineHeight: 1.12, margin: "0 0 16px",
            color: "var(--ink)",
          }}>
            Your dashboard is on its way.
          </h2>

          <p style={{
            fontSize: 16, color: "var(--muted)", lineHeight: 1.65,
            maxWidth: 480, margin: "0 auto 40px",
          }}>
            We&apos;re crafting a powerful review management platform just for you. Your QR funnels, analytics, and AI review engine will all live right here — coming very soon.
          </p>

          {/* Feature preview grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
            marginBottom: 40,
          }} className="feature-preview-grid">
            {COMING_FEATURES.map((f) => (
              <div key={f.label} style={{
                padding: "16px 14px", borderRadius: 14,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                textAlign: "left",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}>
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginTop: 10, marginBottom: 3 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "var(--muted)" }}>
              <span>Build progress</span>
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>Phase 2 of 9</span>
            </div>
            <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                width: "22%", height: "100%",
                background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                borderRadius: 999,
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  animation: "shimmer 2s ease infinite",
                }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--muted-2)", fontFamily: "var(--font-mono)" }}>
              <span>Marketing ✓  Auth ✓  Dashboard ←</span>
              <span>QR · AI · Billing · Admin</span>
            </div>
          </div>

          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 10,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            fontSize: 14, fontWeight: 500, color: "var(--ink-2)",
            textDecoration: "none", transition: "all 0.15s",
          }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            Back to marketing site
          </Link>
        </div>

        {/* Bottom note */}
        <p style={{ marginTop: 32, fontSize: 13, color: "var(--muted-2)", textAlign: "center" }}>
          Questions?{" "}
          <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Contact our team
          </Link>
          {" "}· We typically respond within 24 hours.
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 color-mix(in oklab, var(--accent) 40%, transparent); }
          50% { opacity: 0.7; box-shadow: 0 0 0 5px color-mix(in oklab, var(--accent) 0%, transparent); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @media (max-width: 640px) {
          .feature-preview-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 420px) {
          .feature-preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
