"use client";

import { useState } from "react";

const QRPattern = ({ size = 150, label = "" }: { size?: number; label?: string }) => {
  const cells = 25;
  const cellSize = size / cells;
  const seed = (label || "REEVO").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid: number[] = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const n = Math.sin((x * 53 + y * 91 + seed * 13) * 0.4321) * 10000;
      grid.push((n - Math.floor(n)) > 0.5 ? 1 : 0);
    }
  }
  const setBlock = (sx: number, sy: number) => {
    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++) {
        const onBorder = x === 0 || y === 0 || x === 6 || y === 6;
        const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[(sy + y) * cells + (sx + x)] = onBorder || inner ? 1 : 0;
      }
  };
  setBlock(0, 0); setBlock(cells - 7, 0); setBlock(0, cells - 7);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" rx="8" />
      {grid.map((v, i) => {
        if (!v) return null;
        const x = (i % cells) * cellSize;
        const y = Math.floor(i / cells) * cellSize;
        return <rect key={i} x={x} y={y} width={cellSize * 1.05} height={cellSize * 1.05} fill="#0A0A14" rx={cellSize * 0.15} />;
      })}
      <rect x={size / 2 - 9} y={size / 2 - 9} width={18} height={18} rx="5" fill="url(#mqrg)" />
      <defs>
        <linearGradient id="mqrg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SUGGESTIONS = [
  "Absolutely loved my visit to Sage Salon! The team was friendly, the service was fast, and quality was outstanding.",
  "Exceptional experience at Sage Salon. From start to finish everything was perfect — very professional. Five stars!",
  "Easily the best in town. Sage Salon exceeded my expectations: amazing service and very fair prices. Highly recommend!",
];

function MobileFunnel() {
  const [step, setStep] = useState<"idle" | "rating" | "suggestions" | "done">("idle");
  const [rating, setRating] = useState(0);
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const reset = () => { setStep("idle"); setRating(0); setIdx(0); };

  return (
    <div className="phone">
      <div className="phone-screen">
        <div style={{ height: 38, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 22px 4px", fontSize: 12, fontWeight: 600, color: "#111" }}>
          <span>9:41</span>
        </div>
        <div style={{ flex: 1, padding: "8px 18px 18px", display: "flex", flexDirection: "column", color: "#111" }}>
          <div className="between" style={{ marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Sage Salon</span>
            </div>
            <span style={{ fontSize: 11, color: "#9aa", fontFamily: "var(--font-mono)" }}>via reevo</span>
          </div>

          {step === "idle" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
              <h3 style={{ fontSize: 18, margin: 0, color: "#111", letterSpacing: "-0.02em" }}>Scan to leave a review</h3>
              <div style={{ padding: 8, background: "white", border: "1px solid #EEE", borderRadius: 14 }}>
                <QRPattern size={150} label="SAGE" />
              </div>
              <p style={{ fontSize: 12, color: "#777", margin: 0, maxWidth: 220 }}>Tap the QR — your customers see this when they scan.</p>
              <button className="btn btn-accent btn-sm" onClick={() => setStep("rating")} style={{ marginTop: 4 }}>
                Try the flow
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
              </button>
            </div>
          )}

          {step === "rating" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", gap: 18 }}>
              <div>
                <h3 style={{ fontSize: 20, margin: 0, color: "#111", letterSpacing: "-0.02em" }}>How was your visit?</h3>
                <p style={{ fontSize: 13, color: "#777", margin: "8px 0 0" }}>Tap a star to continue</p>
              </div>
              <div className="row" style={{ justifyContent: "center", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => { setRating(i); setTimeout(() => setStep("suggestions"), 280); }} style={{ background: "transparent", border: 0, padding: 4, cursor: "pointer" }}>
                    <svg width={34} height={34} viewBox="0 0 24 24" fill={i <= rating ? "#F5A623" : "transparent"} stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                      <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                    </svg>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 10, textAlign: "center", color: "#bbb", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>STEP 1 OF 3</div>
            </div>
          )}

          {step === "suggestions" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, paddingTop: 6 }}>
              <div style={{ background: "linear-gradient(135deg, #f0eeff, #e8f4ff)", borderRadius: 12, padding: 12, border: "1px solid #ddd" }}>
                <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white" }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/></svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-ink)" }}>AI suggestion</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: "#222" }}>{SUGGESTIONS[idx]}</div>
              </div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {SUGGESTIONS.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} style={{ padding: "5px 10px", fontSize: 11, border: "1px solid #EEE", borderRadius: 999, background: i === idx ? "#111" : "white", color: i === idx ? "white" : "#444", cursor: "pointer", fontWeight: 500 }}>
                    Option {i + 1}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <button onClick={handleCopy} style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#111", color: "white", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                {copied ? "✓ Copied!" : "Copy review"}
              </button>
              <button onClick={() => setStep("done")} style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "white", color: "#111", border: "1px solid #DDD", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                Continue to Google
              </button>
              <div style={{ fontSize: 10, textAlign: "center", color: "#bbb", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>STEP 2 OF 3</div>
            </div>
          )}

          {step === "done" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 12px 30px -10px rgba(52,168,83,0.45)" }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, color: "#111" }}>Review posted on Google ✨</h3>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#777", maxWidth: 220 }}>Thanks for supporting Sage Salon. Your review helps real people discover us.</p>
              </div>
              <button onClick={reset} style={{ all: "unset", padding: "8px 16px", background: "#F4F4F8", color: "#111", border: "1px solid #EEE", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                Run demo again
              </button>
            </div>
          )}
        </div>
        <div style={{ height: 14, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 100, height: 4, background: "#111", borderRadius: 999, opacity: 0.85 }} />
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: "bolt", t: "Loads in 0.4s", d: "Edge-cached, no fonts to download, no app to install." },
  { icon: "scan", t: "Native QR, native UX", d: "Camera-app native — no extra apps, no friction, no confusion." },
  { icon: "sparkles", t: "One-tap AI suggestions", d: "Three reviews ready before they finish reading the question." },
  { icon: "shield", t: "Privacy-first", d: "Zero PII collected. Just ratings, scans, and clicks. GDPR & CCPA ready." },
];

const FeatureIcon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    scan: <><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><path d="M3 12h18"/></>,
    sparkles: <><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></>,
    shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>,
  };
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

export default function MobileExperience() {
  return (
    <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="me-grid">
          <div>
            <span className="eyebrow"><span className="dot" /> Mobile-first</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Built for the customer&apos;s thumb, not your designer.</h2>
            <p className="lead" style={{ marginTop: 18 }}>
              Reevo funnels are mobile-only — every pixel is tuned for a one-handed, 47-second flow. Average completion time: <strong style={{ color: "var(--ink)" }}>52 seconds</strong>.
            </p>
            <div className="col" style={{ gap: 14, marginTop: 28 }}>
              {FEATURES.map((f, i) => (
                <div key={i} className="row" style={{ gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--accent)", flexShrink: 0 }}>
                    <FeatureIcon name={f.icon} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{f.t}</div>
                    <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 2, lineHeight: 1.5 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <MobileFunnel />
            <div className="floater" style={{ left: -20, top: 60 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>Loaded in 0.4s</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Edge cached globally</div>
              </div>
            </div>
            <div className="floater" style={{ right: -30, bottom: 80 }}>
              <div>
                <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>AVG. COMPLETION</div>
                <div className="row" style={{ gap: 6 }}>
                  <strong style={{ fontSize: 18, letterSpacing: "-0.02em" }}>52s</strong>
                  <span style={{ color: "#117047", fontSize: 11 }}>-12s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`@media (max-width: 1000px) { .me-grid { grid-template-columns: 1fr !important; gap: 56px !important; } }`}</style>
      </div>
    </section>
  );
}
