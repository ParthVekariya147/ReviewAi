/* global React, Icon, Avatar, AnimatedNumber, CTABanner */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const AboutPage = ({ navigate }) => (
  <div data-screen-label="05 About">
    <section className="section" style={{ paddingTop: 80, paddingBottom: 48, position: "relative", overflow: "hidden" }}>
      <div className="bg-gradients" />
      <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: 880 }}>
        <span className="eyebrow"><span className="dot" /> About Reevo</span>
        <h1 className="h1" style={{ marginTop: 18 }}>Building the simplest path from <em>great service</em> to great reviews.</h1>
        <p className="lead" style={{ marginTop: 22, maxWidth: 680, fontSize: 19 }}>
          We started Reevo because our favorite café was closing. They had the best coffee in town and 47 Google reviews. The chain across the street had 2,400. We knew there was a better way.
        </p>
      </div>
    </section>

    <section className="section" style={{ paddingTop: 24 }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="ab-stats">
          {[
            { v: 1000, suffix: "+", l: "Businesses on Reevo" },
            { v: 14, l: "Countries served" },
            { v: 8.4, suffix: "M+", l: "QR scans tracked", decimal: true },
            { v: 1.2, suffix: "M+", l: "Reviews generated", decimal: true },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{s.l.toUpperCase()}</div>
              <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 4 }}>
                {s.decimal ? <><AnimatedNumber value={s.v * 10} format={(v) => (v / 10).toFixed(1)} />{s.suffix}</> : <AnimatedNumber value={s.v} suffix={s.suffix} />}
              </div>
            </div>
          ))}
        </div>
        <style>{`@media (max-width: 800px) { .ab-stats { grid-template-columns: 1fr 1fr !important; } }`}</style>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80 }} className="ab-grid">
          <div className="sticky-aside">
            <span className="eyebrow"><span className="dot" /> Our story</span>
            <h2 className="h2" style={{ marginTop: 18, fontSize: "clamp(32px, 4vw, 44px)" }}>Started with a café. Built for every local business.</h2>
          </div>
          <div className="col" style={{ gap: 32, color: "var(--ink-2)", fontSize: 17, lineHeight: 1.7 }}>
            <p>Local businesses live and die by reviews. A 4.2 vs a 4.6 on Google can mean the difference between a packed Saturday and an empty one. But great businesses are usually too busy <em>being</em> great to ask for reviews — and customers, even happy ones, almost never volunteer.</p>
            <p>The existing tools were either generic (QR code generators that dump customers into a blank Google review form) or sketchy (review-buying services that get businesses banned). Neither solved the actual problem: <strong style={{ color: "var(--ink)" }}>how do you make it effortless for a real, happy customer to leave a real, authentic review?</strong></p>
            <p>So we built Reevo. The QR funnel is simple — scan, rate, see an AI-drafted suggestion that matches your rating and the business's voice, copy, paste, post. The customer is in control the whole way. Every review is real, written by a real person, on their real Google account.</p>
            <p>Today, businesses in 14 countries use Reevo to turn the customers they already have into the reviews they deserve. We're proud of our product. We're prouder of the businesses using it.</p>
          </div>
        </div>
        <style>{`@media (max-width: 900px) { .ab-grid { grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
      </div>
    </section>

    <ValuesSection />
    <TeamSection />
    <InvestorsSection />

    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="container"><CTABanner navigate={navigate} /></div>
    </section>
  </div>
);

const ValuesSection = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
    <div className="container">
      <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
        <span className="eyebrow"><span className="dot" /> Values</span>
        <h2 className="h2" style={{ marginTop: 18 }}>What we won't compromise on.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="val-grid">
        {[
          { i: "shield", t: "Real customers only", b: "We don't generate fake reviews. We help real customers write authentic ones." },
          { i: "heart", t: "The local business wins", b: "Every decision starts with: does this help the owner, or just us?" },
          { i: "bolt", t: "Boringly reliable", b: "If you can't trust the QR to load, none of the AI matters. Reliability is product." },
          { i: "users", t: "No surprise pricing", b: "Plans are simple. You never get a 'usage overage' email." },
          { i: "sparkles", t: "Beautiful is a feature", b: "Customers won't scan an ugly QR or use a clunky funnel. Design is conversion." },
          { i: "globe", t: "Built for the world", b: "24 languages, every continent, time zones that aren't ours." },
        ].map((v, i) => (
          <div key={i} className="card lift" style={{ padding: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--accent-2) 18%, transparent))", color: "var(--accent)", display: "grid", placeItems: "center", marginBottom: 14 }}>
              <Icon name={v.i} size={18} />
            </div>
            <h4 style={{ margin: 0, fontSize: 17, letterSpacing: "-0.01em" }}>{v.t}</h4>
            <p style={{ fontSize: 14, color: "var(--muted)", margin: "8px 0 0", lineHeight: 1.55 }}>{v.b}</p>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 900px) { .val-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  </section>
);

const TEAM = [
  { name: "Liam Park", role: "Co-founder & CEO", bio: "Ex-Stripe. Once built an espresso machine.", color: "#7B61FF" },
  { name: "Aanya Sharma", role: "Co-founder & CTO", bio: "Ex-Notion. Wrote Reevo's first 300 lines.", color: "#3B82F6" },
  { name: "Marcus Hill", role: "Head of Product", bio: "Ex-Linear. Studies funnels like a hobby.", color: "#F4A861" },
  { name: "Priya Iyer", role: "Head of Design", bio: "Ex-Figma. Cares about button spacing.", color: "#E48BD3" },
  { name: "Jonas Berg", role: "Head of Engineering", bio: "Ex-Vercel. Loves edge functions.", color: "#7CD8A9" },
  { name: "Sofía Reyes", role: "Head of Customer Success", bio: "Ex-HubSpot. Onboarded our first 500.", color: "#67C3F2" },
];

const TeamSection = () => (
  <section className="section">
    {/* <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 40 }} className="team-head">
        <div>
          <span className="eyebrow"><span className="dot" /> Team</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Small team. Big ambitions for small businesses.</h2>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: 460 }}>
          14 people across San Francisco, Bangalore, and Berlin. We hire engineers who can ship, designers who can code, and operators who've owned a small business.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="team-grid">
        {TEAM.map((p, i) => (
          <div key={i} className="card lift" style={{ padding: 24 }}>
            <div style={{
              width: "100%", aspectRatio: "1 / 1", borderRadius: 14, marginBottom: 16,
              background: `linear-gradient(135deg, ${p.color}, color-mix(in oklab, ${p.color} 60%, black))`,
              display: "grid", placeItems: "center", color: "white", fontSize: 56, fontWeight: 600, letterSpacing: "-0.04em",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
            }}>
              {p.name.split(" ").map(s => s[0]).join("")}
            </div>
            <div className="between">
              <div>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{p.role}</div>
              </div>
              <div className="row" style={{ gap: 4 }}>
                <a className="chip" style={{ width: 28, height: 28, padding: 0, justifyContent: "center" }}><Icon name="twitter" size={12} /></a>
                <a className="chip" style={{ width: 28, height: 28, padding: 0, justifyContent: "center" }}><Icon name="linkedin" size={12} /></a>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 14, lineHeight: 1.5, fontStyle: "italic" }}>{p.bio}</p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 900px) {
          .team-grid { grid-template-columns: 1fr 1fr !important; }
          .team-head { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (max-width: 600px) { .team-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div> */}
  </section>
);

const InvestorsSection = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
    <div className="container" style={{ textAlign: "center" }}>
      <span className="eyebrow"><span className="dot" /> Backed by</span>
      <h3 className="h2" style={{ marginTop: 18, fontSize: "clamp(28px, 3vw, 36px)" }}>The people who fund local-business software.</h3>
      <div className="logos-strip" style={{ marginTop: 40 }}>
        {["Sequoia", "Accel", "Index", "Stripe Press", "First Round", "Floodgate"].map(n => (
          <div key={n}>{n}</div>
        ))}
      </div>
    </div>
  </section>
);

Object.assign(window, { AboutPage });
