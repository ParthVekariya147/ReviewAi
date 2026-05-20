import Link from "next/link";

export default function CTASection() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="container">
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: "72px 64px", background: "linear-gradient(135deg, #0A0A14 0%, #1A1538 60%, #2D2070 100%)", color: "white", boxShadow: "0 40px 80px -30px rgba(40,30,120,0.4)" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, color-mix(in oklab, var(--accent-2) 60%, transparent), transparent 50%), radial-gradient(circle at 10% 90%, color-mix(in oklab, var(--accent) 50%, transparent), transparent 50%)", opacity: 0.6 }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)" }} />
          <div style={{ position: "relative", maxWidth: 720 }}>
            <div className="eyebrow" style={{ background: "rgba(255,255,255,0.1)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
              <span className="dot" style={{ background: "white", boxShadow: "0 0 0 4px rgba(255,255,255,0.2)" }} />
              Free 14-day trial — no card required
            </div>
            <h2 className="h1" style={{ color: "white", marginTop: 18, fontSize: "clamp(36px, 5vw, 64px)" }}>
              Start growing your Google reviews{" "}
              <em style={{ background: "linear-gradient(110deg, #C8C1FF, #8FC2FF)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                today.
              </em>
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginTop: 18, maxWidth: 540, lineHeight: 1.55 }}>
              Print one QR code, start collecting authentic reviews tonight. Cancel anytime.
            </p>
            <div className="row" style={{ marginTop: 28, gap: 12 }}>
              <Link href="/signup" className="btn btn-lg" style={{ background: "white", color: "#0A0A14", borderColor: "white" }}>
                Start free trial
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/contact" className="btn btn-lg" style={{ background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
