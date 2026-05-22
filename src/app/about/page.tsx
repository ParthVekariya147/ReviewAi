import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About",
  description: "Building the simplest path from great service to great reviews. Reevo helps local businesses turn happy customers into authentic 5-star Google reviews.",
  alternates: { canonical: "/about" },
};

const STATS = [
  { v: "1,000+", l: "Businesses on Reevo" },
  { v: "14", l: "Countries served" },
  { v: "8.4M+", l: "QR scans tracked" },
  { v: "1.2M+", l: "Reviews generated" },
];

const VALUES = [
  { icon: "shield", t: "Real customers only", b: "We don't generate fake reviews. We help real customers write authentic ones." },
  { icon: "heart", t: "The local business wins", b: "Every decision starts with: does this help the owner, or just us?" },
  { icon: "bolt", t: "Boringly reliable", b: "If you can't trust the QR to load, none of the AI matters. Reliability is product." },
  { icon: "users", t: "No surprise pricing", b: "Plans are simple. You never get a 'usage overage' email." },
  { icon: "sparkles", t: "Beautiful is a feature", b: "Customers won't scan an ugly QR or use a clunky funnel. Design is conversion." },
  { icon: "globe", t: "Built for the world", b: "24 languages, every continent, time zones that aren't ours." },
];

const TEAM = [
  { name: "Liam Park", role: "Co-founder & CEO", bio: "Ex-Stripe. Once built an espresso machine.", color: "#7B61FF" },
  { name: "Aanya Sharma", role: "Co-founder & CTO", bio: "Ex-Notion. Wrote Reevo's first 300 lines.", color: "#3B82F6" },
  { name: "Marcus Hill", role: "Head of Product", bio: "Ex-Linear. Studies funnels like a hobby.", color: "#F4A861" },
  { name: "Priya Iyer", role: "Head of Design", bio: "Ex-Figma. Cares about button spacing.", color: "#E48BD3" },
  { name: "Jonas Berg", role: "Head of Engineering", bio: "Ex-Vercel. Loves edge functions.", color: "#7CD8A9" },
  { name: "Sofía Reyes", role: "Head of Customer Success", bio: "Ex-HubSpot. Onboarded our first 500.", color: "#67C3F2" },
];

const INVESTORS = ["Sequoia", "Accel", "Index", "Stripe Press", "First Round", "Floodgate"];

function ValueIcon({ name }: { name: string }) {
  if (name === "shield") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>
    </svg>
  );
  if (name === "heart") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
  if (name === "bolt") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
  if (name === "users") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
  if (name === "sparkles") return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/>
      <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/>
    </svg>
  );
  // globe
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  );
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section className="section" style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}>
          <div className="bg-gradients" />
          <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: 880 }}>
            <span className="eyebrow"><span className="dot" /> About Reevo</span>
            <h1 className="h1" style={{ marginTop: 18 }}>
              Building the simplest path from <em>great service</em> to great reviews.
            </h1>
            <p className="lead" style={{ marginTop: 22, maxWidth: 680, fontSize: 19 }}>
              We started Reevo because our favorite café was closing. They had the best coffee in town and 47 Google reviews. The chain across the street had 2,400. We knew there was a better way.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="section" style={{ paddingTop: 24 }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="ab-stats">
              {STATS.map((s) => (
                <div key={s.l} className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{s.l.toUpperCase()}</div>
                  <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our story */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80 }} className="ab-grid">
              <div className="sticky-aside">
                <span className="eyebrow"><span className="dot" /> Our story</span>
                <h2 className="h2" style={{ marginTop: 18, fontSize: "clamp(32px, 4vw, 44px)" }}>
                  Started with a café. Built for every local business.
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 32, color: "var(--ink-2)", fontSize: 17, lineHeight: 1.7 }}>
                <p>Local businesses live and die by reviews. A 4.2 vs a 4.6 on Google can mean the difference between a packed Saturday and an empty one. But great businesses are usually too busy <em>being</em> great to ask for reviews — and customers, even happy ones, almost never volunteer.</p>
                <p>The existing tools were either generic (QR code generators that dump customers into a blank Google review form) or sketchy (review-buying services that get businesses banned). Neither solved the actual problem: <strong style={{ color: "var(--ink)" }}>how do you make it effortless for a real, happy customer to leave a real, authentic review?</strong></p>
                <p>So we built Reevo. The QR funnel is simple — scan, rate, see an AI-drafted suggestion that matches your rating and the business&apos;s voice, copy, paste, post. The customer is in control the whole way. Every review is real, written by a real person, on their real Google account.</p>
                <p>Today, businesses in 14 countries use Reevo to turn the customers they already have into the reviews they deserve. We&apos;re proud of our product. We&apos;re prouder of the businesses using it.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="container">
            <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
              <span className="eyebrow"><span className="dot" /> Values</span>
              <h2 className="h2" style={{ marginTop: 18 }}>What we won&apos;t compromise on.</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="val-grid">
              {VALUES.map((v) => (
                <div key={v.t} className="card lift" style={{ padding: 24 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--accent-2) 18%, transparent))",
                    color: "var(--accent)", display: "grid", placeItems: "center", marginBottom: 14,
                  }}>
                    <ValueIcon name={v.icon} />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 17, letterSpacing: "-0.01em" }}>{v.t}</h4>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.55 }}>{v.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 40 }} className="team-head">
              <div>
                <span className="eyebrow"><span className="dot" /> Team</span>
                <h2 className="h2" style={{ marginTop: 18 }}>Small team. Big ambitions for small businesses.</h2>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: 460 }}>
                14 people across San Francisco, Bangalore, and Berlin. We hire engineers who can ship, designers who can code, and operators who&apos;ve owned a small business.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="team-grid">
              {TEAM.map((p) => (
                <div key={p.name} className="card lift" style={{ padding: 24 }}>
                  <div style={{
                    width: "100%", aspectRatio: "1 / 1", borderRadius: 14, marginBottom: 16,
                    background: `linear-gradient(135deg, ${p.color}, color-mix(in oklab, ${p.color} 60%, black))`,
                    display: "grid", placeItems: "center", color: "white", fontSize: 56, fontWeight: 600, letterSpacing: "-0.04em",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
                  }}>
                    {p.name.split(" ").map((s) => s[0]).join("")}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>{p.role}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <a className="chip" style={{ width: 28, height: 28, padding: 0, justifyContent: "center", display: "grid", placeItems: "center" }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                      <a className="chip" style={{ width: 28, height: 28, padding: 0, justifyContent: "center", display: "grid", placeItems: "center" }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 14, lineHeight: 1.5, fontStyle: "italic" }}>{p.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Backed by */}
        <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <span className="eyebrow"><span className="dot" /> Backed by</span>
            <h2 className="h2" style={{ marginTop: 18, fontSize: "clamp(28px, 3vw, 36px)" }}>The people who fund local-business software.</h2>
            <div className="logos-strip" style={{ marginTop: 40 }}>
              {INVESTORS.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <CTABanner />
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 800px) { .ab-stats { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 900px) {
          .ab-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .val-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr 1fr !important; }
          .team-head { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (max-width: 600px) { .team-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

function CTABanner() {
  return (
    <div style={{
      borderRadius: 24,
      background: "linear-gradient(135deg, var(--ink) 0%, #2A1F8F 100%)",
      padding: "64px 56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 40,
      position: "relative",
      overflow: "hidden",
      marginBottom: 0,
    }} className="cta-inner">
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "40px 40px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)" }} />
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>Get started today</div>
        <h2 style={{ fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 700, color: "white", margin: "0 0 10px", letterSpacing: "-0.025em" }}>Your next 100 reviews are waiting.</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: 0 }}>Start free. No credit card. Up in 3 minutes.</p>
      </div>
      <div style={{ display: "flex", gap: 12, flexShrink: 0, position: "relative" }}>
        <Link href="/signup" className="btn" style={{ background: "white", color: "var(--ink)", fontWeight: 600 }}>
          Start free
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
        </Link>
        <Link href="/demo" className="btn" style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.18)" }}>
          See a demo
        </Link>
      </div>
      <style>{`@media (max-width: 700px) { .cta-inner { flex-direction: column; padding: 40px 28px !important; align-items: flex-start !important; } }`}</style>
    </div>
  );
}
