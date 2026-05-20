"use client";

import { useEffect, useRef, useState } from "react";

const AnimatedNumber = ({
  value,
  suffix = "",
  format,
}: {
  value: number;
  suffix?: string;
  format?: (v: number) => string;
}) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const animate = (t: number) => {
            const p = Math.min(1, (t - start) / 1100);
            const eased = 1 - Math.pow(1 - p, 3);
            setV(value * eased);
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  const display = format
    ? format(Math.round(v))
    : Math.round(v) >= 1_000_000
    ? (Math.round(v) / 1_000_000).toFixed(1) + "M"
    : Math.round(v) >= 1000
    ? (Math.round(v) / 1000).toFixed(0) + "K"
    : Math.round(v).toString();

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

const STATS = [
  { label: "QR scans tracked", v: 8_400_000, suffix: "+" },
  { label: "Google reviews generated", v: 1_240_000, suffix: "+" },
  { label: "Average 5★ rate", v: 92, suffix: "%" },
  { label: "Avg. setup time (min)", v: 3, suffix: "" },
];

const LOGOS = ["maison", "sage", "vista", "crisp", "elev8", "spruce"];

export default function TrustSection() {
  return (
    <section className="section" style={{ paddingTop: 120, paddingBottom: 64 }}>
      <div className="container">
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", letterSpacing: "0.06em", fontFamily: "var(--font-mono)", marginBottom: 32 }}>
          TRUSTED BY 1,000+ LOCAL BUSINESSES ACROSS 14 COUNTRIES
        </p>
        <div className="logos-strip">
          {LOGOS.map((n) => (
            <div key={n} style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 26 }}>{n}</div>
          ))}
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 56 }}
          className="trust-stats"
        >
          {STATS.map((s, i) => (
            <div key={i} className="card" style={{ padding: 24, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
                {s.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 8 }}>
                <AnimatedNumber value={s.v} suffix={s.suffix} />
              </div>
            </div>
          ))}
        </div>

        <style>{`@media (max-width: 800px) { .trust-stats { grid-template-columns: 1fr 1fr !important; } }`}</style>
      </div>
    </section>
  );
}
