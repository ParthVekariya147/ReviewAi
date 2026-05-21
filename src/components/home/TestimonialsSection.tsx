"use client";

import { useState, useEffect } from "react";

const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const letters = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const hue = (name.charCodeAt(0) * 37) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, hsl(${hue} 70% 60%), hsl(${(hue + 40) % 360} 75% 50%))`, color: "white", display: "grid", placeItems: "center", fontSize: size * 0.36, fontWeight: 600, letterSpacing: "-0.02em", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)", flexShrink: 0 }}>
      {letters}
    </div>
  );
};

const Stars = ({ value = 5, size = 16 }: { value?: number; size?: number }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= value ? "#F5A623" : "transparent"} stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
      </svg>
    ))}
  </div>
);

const TESTIMONIALS = [
  {
    body: "We went from 12 Google reviews a month to 87. The funnel is so smooth our customers actually want to leave a review — and they're all 5-star.",
    name: "Sofía Reyes", role: "Owner, Maison Café",
    metric: "+625% reviews in 8 weeks",
  },
  {
    body: "The AI suggestions are the magic. Customers tap copy, paste in Google, and post. We get authentic, well-written reviews without any awkwardness.",
    name: "Marcus Lin", role: "Founder, Sage Salon Group",
    metric: "4.9★ average across 6 locations",
  },
  {
    body: "We rolled Reevo out to 23 dental clinics in two days. The analytics let us see exactly which front desks need a nudge.",
    name: "Dr. Priya N.", role: "Operations, Vista Dental",
    metric: "23 locations, 1 dashboard",
  },
  {
    body: "I was sceptical about another QR thing, but my dry cleaner customers actually use it. It just works. Reviews are pouring in.",
    name: "Karim Adel", role: "Owner, Crisp Linen",
    metric: "Live in 3 minutes",
  },
];

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((v) => (v + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(id);
  }, []);
  const t = TESTIMONIALS[idx];

  return (
    <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 48px" }}>
          <span className="eyebrow"><span className="dot" /> Customers</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Owners who replaced &ldquo;leave us a review&rdquo; cards forever.</h2>
        </div>

        {/* Carousel */}
        <div className="card" style={{ padding: "40px 44px", background: "linear-gradient(180deg, var(--surface), var(--bg-soft))", borderRadius: 24, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <Stars value={5} size={18} />
            <span className="chip accent">{t.metric}</span>
          </div>
          <p key={idx} className="fade-up" style={{ fontSize: 26, lineHeight: 1.35, letterSpacing: "-0.02em", color: "var(--ink)", fontWeight: 500, margin: 0, maxWidth: 920 }}>
            &ldquo;{t.body}&rdquo;
          </p>
          <div className="between" style={{ marginTop: 32 }}>
            <div className="row" style={{ gap: 14 }}>
              <Avatar name={t.name} size={48} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{t.role}</div>
              </div>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {TESTIMONIALS.map((_, j) => (
                <button
                  key={j}
                  onClick={() => setIdx(j)}
                  aria-label={`Go to testimonial ${j + 1}`}
                  style={{ width: j === idx ? 24 : 8, height: 8, borderRadius: 999, background: j === idx ? "var(--accent)" : "var(--border-strong)", border: 0, cursor: "pointer", transition: "width .3s, background .2s" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }} className="t-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card lift" style={{ padding: 24 }}>
              <Stars value={5} size={14} />
              <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-2)", marginTop: 12, marginBottom: 18 }}>
                &ldquo;{t.body}&rdquo;
              </p>
              <div className="row" style={{ gap: 10 }}>
                <Avatar name={t.name} size={36} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <style>{`@media (max-width: 900px) { .t-grid { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </section>
  );
}
