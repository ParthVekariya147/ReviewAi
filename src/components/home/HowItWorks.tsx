const QRPattern = ({ size = 140, label = "" }: { size?: number; label?: string }) => {
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
      <rect x={size / 2 - 14} y={size / 2 - 14} width={28} height={28} fill="white" rx="6" />
      <rect x={size / 2 - 9} y={size / 2 - 9} width={18} height={18} rx="5" fill="url(#qrg)" />
      <defs>
        <linearGradient id="qrg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const StepBlock = ({ idx, title, body }: { idx: number; title: string; body: string }) => (
  <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", color: "white", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 14, boxShadow: "0 8px 18px -8px color-mix(in oklab, var(--accent) 50%, transparent)" }}>
      {String(idx).padStart(2, "0")}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: 20, letterSpacing: "-0.015em" }}>{title}</h4>
      <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 15, lineHeight: 1.55, maxWidth: 480 }}>{body}</p>
    </div>
  </div>
);

const STEPS = [
  { title: "Print your QR funnel", body: "Create a campaign in 30 seconds. Print the QR — table tents, stickers, receipts, business cards. We ship printed kits too." },
  { title: "Customer scans, rates", body: "No app. No login. Customers tap stars on a mobile-optimized funnel branded as you. High-rating funnel routes straight to Google." },
  { title: "AI drafts the review", body: "One-tap, GPT-powered review suggestions match the customer's rating and your business voice. They edit (or don't) and copy." },
  { title: "Review posts to Google", body: "Smart redirect drops them right in your Google Business profile review box, clipboard ready. Real customer, real review." },
];

const EVENTS = [
  { i: "sparkles", label: "AI generated 3 suggestions in 0.8s", chip: "AI" },
  { i: "copy", label: "Customer copied 5★ review", chip: "COPY" },
  { i: "google", label: "Redirected to Google Reviews", chip: "POST" },
  { i: "star", label: "Review posted publicly on Google", chip: "DONE" },
];

const SmallIcon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    sparkles: <><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></>,
    google: <><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H3v2.7C4.7 19.8 8.1 22 12 22z" fill="#34A853" stroke="none"/><path d="M6.3 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.5H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.3-2.7z" fill="#FBBC05" stroke="none"/><path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.3 2.7C7.1 7.6 9.4 5.8 12 5.8z" fill="#EA4335" stroke="none"/></>,
    star: <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />,
    scan: <><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><path d="M3 12h18"/></>,
  };
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 64px" }}>
          <span className="eyebrow"><span className="dot" /> How it works</span>
          <h2 className="h2" style={{ marginTop: 18 }}>From scan to 5-star review — in under a minute.</h2>
          <p className="lead" style={{ margin: "16px auto 0" }}>
            A four-step funnel that meets customers where they are: on their phone, in your shop, at the perfect moment.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="how-grid">
          <div className="col" style={{ gap: 36 }}>
            {STEPS.map((s, i) => <StepBlock key={i} idx={i + 1} title={s.title} body={s.body} />)}
          </div>

          <div>
            <div className="card" style={{ padding: 32, background: "linear-gradient(180deg, var(--surface), var(--bg-tint))", borderRadius: 24, boxShadow: "var(--shadow-lg)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center" }}>
                <div style={{ padding: 14, background: "white", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow-sm)" }}>
                  <QRPattern size={140} label="HOWITWORKS" />
                </div>
                <div>
                  <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                    <SmallIcon name="scan" />
                    <span className="kicker">SCAN</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>Maison Café</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>How was your visit?</div>
                  <div className="row" style={{ marginTop: 12, gap: 2 }}>
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} width={18} height={18} viewBox="0 0 24 24" fill="#F5A623" stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                        <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: "var(--border)", margin: "28px 0" }} />

              <div className="col" style={{ gap: 10 }}>
                {EVENTS.map((e, i) => (
                  <div key={i} className="row" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, gap: 12 }}>
                    <SmallIcon name={e.i} />
                    <span style={{ fontSize: 13, color: "var(--ink-2)", flex: 1 }}>{e.label}</span>
                    <span className="chip" style={{ fontSize: 10 }}>{e.chip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`@media (max-width: 900px) { .how-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
      </div>
    </section>
  );
}
