const FeatureIcon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    sparkles: <><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></>,
    qr: <><path d="M3 3h7v7H3z"/><path d="M14 3h7v7h-7z"/><path d="M3 14h7v7H3z"/><path d="M14 14h3"/><path d="M14 17v4"/><path d="M17 17h4v4"/></>,
    funnel: <path d="M3 5h18l-7 8v6l-4-2v-4z"/>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    google: <><path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H3v2.7C4.7 19.8 8.1 22 12 22z" fill="#34A853" stroke="none"/><path d="M6.3 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.5H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.3-2.7z" fill="#FBBC05" stroke="none"/><path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.3 2.7C7.1 7.6 9.4 5.8 12 5.8z" fill="#EA4335" stroke="none"/></>,
    scan: <><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><path d="M3 12h18"/></>,
    palette: <><path d="M12 3a9 9 0 100 18c1 0 2-1 2-2s-1-1-1-2 1-2 2-2h2a4 4 0 004-4c0-4-4-8-9-8z"/><circle cx="7.5" cy="10.5" r="1.5"/><circle cx="12" cy="7.5" r="1.5"/><circle cx="16.5" cy="10.5" r="1.5"/></>,
    creditCard: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
  };
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const MiniFunnelPreview = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
    {[100, 78, 58, 22].map((v, i) => (
      <div key={i} style={{ height: 8, width: `${v}%`, borderRadius: 4, background: `linear-gradient(90deg, color-mix(in oklab, var(--accent) ${100 - i * 10}%, var(--accent-2)), var(--accent-2))` }} />
    ))}
  </div>
);

const MiniKPIPreview = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
    <div style={{ padding: 8, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: "var(--muted)" }}>RATE</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>49.0%</div>
    </div>
    <div style={{ padding: 8, background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: "var(--muted)" }}>REVIEWS</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>1,842</div>
    </div>
  </div>
);

const MiniSuggestPreview = () => (
  <div style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
    <div className="row" style={{ gap: 6, marginBottom: 6 }}>
      <FeatureIcon name="sparkles" />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.04em", color: "var(--accent)" }}>SUGGESTION · 5★</span>
    </div>
    <div style={{ color: "var(--ink-2)", lineHeight: 1.5, fontSize: 12 }}>Absolutely loved my visit — the team was friendly and the croissants were…</div>
  </div>
);

const FEATURES = [
  { icon: "sparkles", title: "AI review suggestions", body: "GPT-4 drafts 3 review options tuned to the customer's rating and your business voice. Tone editable per campaign.", preview: <MiniSuggestPreview /> },
  { icon: "qr", title: "Dynamic QR campaigns", body: "One QR, many destinations. Change campaigns or messaging without reprinting a thing." },
  { icon: "funnel", title: "Funnel analytics", body: "See every step: scan, rating, copy, redirect, post. Find the friction, fix it in clicks.", preview: <MiniFunnelPreview /> },
  { icon: "target", title: "Conversion tracking", body: "Real-time KPIs on funnel completion rate, drop-off points, and review velocity per location.", preview: <MiniKPIPreview /> },
  { icon: "google", title: "Google redirect tracking", body: "Confirm reviews land on Google with attribution back to the QR, campaign, and location." },
  { icon: "scan", title: "Dynamic QR management", body: "Pause, retire, or re-route any QR live. Schedule campaigns by hour, day, or location." },
  { icon: "palette", title: "Custom branding", body: "Your logo, fonts, gradients. Funnel domains on your URL (reviews.yourbiz.com)." },
  { icon: "creditCard", title: "Subscription management", body: "Manage seats, locations, and plans from one billing console. Tax & invoicing built in." },
];

export default function FeaturesGrid() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 48 }} className="fg-head">
          <div>
            <span className="eyebrow"><span className="dot" /> Product</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Everything you need to scale authentic reviews.</h2>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginBottom: 8 }}>
            A complete review-conversion platform built for owners who don&apos;t have a marketing team. Eight tools, one dashboard.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="card lift" style={{ padding: 24, height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, transparent), color-mix(in oklab, var(--accent-2) 18%, transparent))", color: "var(--accent)", display: "grid", placeItems: "center", marginBottom: 14, border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)" }}>
                <FeatureIcon name={f.icon} />
              </div>
              <h4 style={{ margin: 0, fontSize: 17, letterSpacing: "-0.01em" }}>{f.title}</h4>
              <p style={{ margin: "8px 0 14px", fontSize: 14, color: "var(--muted)", lineHeight: 1.55, flex: 1 }}>{f.body}</p>
              {f.preview && <div style={{ marginTop: "auto" }}>{f.preview}</div>}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <a href="/features" className="btn btn-ghost">
            See every feature
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
          </a>
        </div>

        <style>{`@media (max-width: 800px) { .fg-head { grid-template-columns: 1fr !important; gap: 16px !important; } }`}</style>
      </div>
    </section>
  );
}
