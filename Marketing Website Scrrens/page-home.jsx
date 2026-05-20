/* global React, Icon, Avatar, BrandMark, Stars, QRPattern, AnimatedNumber, Sparkline, AreaChart, BarChart, Donut, FunnelChart, DashboardPreview, ReviewsFeed, MobileFunnel, PricingCards, FAQList, FeatureCard, TestimonialCarousel, StepBlock, CTABanner */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const HomePage = ({ navigate }) => {
  return (
    <div data-screen-label="01 Home">
      <HomeHero navigate={navigate} />
      <TrustSection />
      <HowItWorks />
      <FeatureGrid navigate={navigate} />
      <AnalyticsShowcase />
      <IndustriesStrip navigate={navigate} />
      <MobileExperience />
      <PricingPreview navigate={navigate} />
      <TestimonialsSection />
      <HomeFAQ navigate={navigate} />
      <FinalCTA navigate={navigate} />
    </div>
  );
};

/* ===== HERO ===== */
const HomeHero = ({ navigate }) => (
  <section className="section" style={{ paddingTop: 80, paddingBottom: 100, position: "relative", overflow: "hidden" }}>
    <div className="bg-gradients" />
    <div className="grid-bg" />
    <div className="container" style={{ position: "relative", zIndex: 1 }}>
      <div style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
        <div className="row" style={{ justifyContent: "center", marginBottom: 24 }}>
          <span className="eyebrow"><span className="dot" />New · AI-powered review suggestions</span>
        </div>
        <h1 className="h1">
          Turn customer visits into <em>authentic Google reviews.</em>
        </h1>
        <p className="lead" style={{ margin: "22px auto 0", textAlign: "center" }}>
          Reevo is the AI-powered QR funnel that helps local businesses convert real, happy customers into 5-star Google reviews — in under a minute, from any phone.
        </p>
        <div className="row" style={{ justifyContent: "center", gap: 12, marginTop: 32 }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("signup")}>
            Start free trial <Icon name="arrow" size={15} />
          </button>
          <button className="btn btn-ghost btn-lg">
            <Icon name="play" size={13} /> Watch 2-min demo
          </button>
        </div>
        <div className="row" style={{ justifyContent: "center", gap: 24, marginTop: 24, fontSize: 13, color: "var(--muted)" }}>
          <span className="row" style={{ gap: 6 }}><Icon name="check" size={14} /> No credit card</span>
          <span className="row" style={{ gap: 6 }}><Icon name="check" size={14} /> Setup in 3 minutes</span>
          <span className="row" style={{ gap: 6 }}><Icon name="check" size={14} /> Google compliant</span>
        </div>
      </div>

      {/* dashboard + phone composition */}
      <div style={{ position: "relative", marginTop: 80, maxWidth: 1180, marginLeft: "auto", marginRight: "auto" }}>
        <DashboardPreview />

        {/* floating phone */}
        <div style={{ position: "absolute", right: -10, bottom: -80, transform: "rotate(2deg)" }} className="hero-phone">
          <MobileFunnel />
        </div>

        {/* floating cards */}
        <div className="floater" style={{ left: -32, top: 80 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white" }}>
            <Icon name="scan" size={16} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>SCANS · TODAY</div>
            <div className="row" style={{ gap: 6, alignItems: "baseline" }}>
              <strong style={{ fontSize: 18, letterSpacing: "-0.02em" }}>
                <AnimatedNumber value={1284} />
              </strong>
              <span style={{ color: "#117047", fontSize: 11 }}>+18%</span>
            </div>
          </div>
        </div>
        <div className="floater" style={{ left: 80, bottom: 60 }}>
          <Stars value={5} size={14} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>New review posted</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Priya N. · 2s ago</div>
          </div>
          <span className="chip green" style={{ fontSize: 10 }}>5★</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .hero-phone { display: none; }
        }
      `}</style>
    </div>
  </section>
);

/* ===== TRUST ===== */
const TrustSection = () => (
  <section className="section" style={{ paddingTop: 120, paddingBottom: 64 }}>
    <div className="container">
      <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", letterSpacing: "0.06em", fontFamily: "var(--font-mono)", marginBottom: 32 }}>
        TRUSTED BY 1,000+ LOCAL BUSINESSES ACROSS 14 COUNTRIES
      </p>
      <div className="logos-strip">
        {["maison", "sage", "vista", "crisp", "elev8", "spruce"].map((n) => (
          <div key={n} style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 26 }}>{n}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 56 }} className="trust-stats">
        {[
          { label: "QR scans tracked", v: 8_400_000, suffix: "+" },
          { label: "Google reviews generated", v: 1_240_000, suffix: "+" },
          { label: "Average 5★ rate", v: 92, suffix: "%" },
          { label: "Avg. setup time (min)", v: 3, suffix: "" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 24, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.025em", marginTop: 8 }}>
              <AnimatedNumber value={s.v} suffix={s.suffix} format={(v) => v >= 1000 ? (v / 1_000_000 >= 1 ? (v/1_000_000).toFixed(1) + "M" : (v/1000).toFixed(0) + "K") : v.toString()} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 800px) { .trust-stats { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  </section>
);

/* ===== HOW IT WORKS ===== */
const HowItWorks = () => (
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
          <StepBlock idx={1} title="Print your QR funnel"
            body="Create a campaign in 30 seconds. Print the QR — table tents, stickers, receipts, business cards. We ship printed kits too." />
          <StepBlock idx={2} title="Customer scans, rates"
            body="No app. No login. Customers tap stars on a mobile-optimized funnel branded as you. High-rating funnel routes straight to Google." />
          <StepBlock idx={3} title="AI drafts the review"
            body="One-tap, GPT-powered review suggestions match the customer's rating and your business voice. They edit (or don't) and copy." />
          <StepBlock idx={4} title="Review posts to Google"
            body="Smart redirect drops them right in your Google Business profile review box, clipboard ready. Real customer, real review." />
        </div>

        <div style={{ position: "relative" }}>
          <div className="card" style={{ padding: 32, background: "linear-gradient(180deg, var(--surface), var(--bg-tint))", borderRadius: 24, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "center" }}>
              <div style={{ padding: 14, background: "white", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow-sm)" }}>
                <QRPattern size={140} label="HOWITWORKS" />
              </div>
              <div>
                <div className="row" style={{ gap: 6, marginBottom: 8 }}><Icon name="scan" size={14} color="var(--accent)" /><span className="kicker">SCAN</span></div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.015em" }}>Maison Café</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>How was your visit?</div>
                <div className="row" style={{ marginTop: 12, gap: 4 }}><Stars value={5} size={18} /></div>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)", margin: "28px 0" }} />

            <div className="col" style={{ gap: 12 }}>
              {[
                { i: "sparkles", label: "AI generated 3 suggestions in 0.8s", chip: "AI" },
                { i: "copy", label: "Customer copied 5★ review", chip: "COPY" },
                { i: "google", label: "Redirected to Google Reviews", chip: "POST" },
                { i: "star", label: "Review posted publicly on Google", chip: "DONE" },
              ].map((e, i) => (
                <div key={i} className="row" style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, gap: 12 }}>
                  <Icon name={e.i} size={16} />
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

/* ===== FEATURE GRID ===== */
const FeatureGrid = ({ navigate }) => (
  <section className="section">
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 48 }} className="fg-head">
        <div>
          <span className="eyebrow"><span className="dot" /> Product</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Everything you need to scale authentic reviews.</h2>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginBottom: 8 }}>
          A complete review-conversion platform built for owners who don't have a marketing team. Eight tools, one dashboard.
        </p>
      </div>

      <div className="feature-grid">
        <FeatureCard icon="sparkles" title="AI review suggestions" body="GPT-4 drafts 3 review options tuned to the customer's rating and your business voice. Tone editable per campaign." preview={<MiniSuggestPreview />} />
        <FeatureCard icon="qr" title="Dynamic QR campaigns" body="One QR, many destinations. Change campaigns or messaging without reprinting a thing." preview={<QRPattern size={64} label="DYN" />} />
        <FeatureCard icon="funnel" title="Funnel analytics" body="See every step: scan, rating, copy, redirect, post. Find the friction, fix it in clicks." preview={<MiniFunnelPreview />} />
        <FeatureCard icon="target" title="Conversion tracking" body="Real-time KPIs on funnel completion rate, drop-off points, and review velocity per location." preview={<MiniKPIPreview />} />
        <FeatureCard icon="google" title="Google redirect tracking" body="Confirm reviews land on Google with attribution back to the QR, campaign, and location." preview={<MiniRedirectPreview />} />
        <FeatureCard icon="scan" title="Dynamic QR management" body="Pause, retire, or re-route any QR live. Schedule campaigns by hour, day, or location." />
        <FeatureCard icon="palette" title="Custom branding" body="Your logo, fonts, gradients. Funnel domains on your URL (reviews.yourbiz.com)." />
        <FeatureCard icon="creditCard" title="Subscription management" body="Manage seats, locations, and plans from one billing console. Tax & invoicing built in." />
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <button className="btn btn-ghost" onClick={() => navigate("features")}>
          See every feature <Icon name="arrow" size={14} />
        </button>
      </div>

      <style>{`@media (max-width: 800px) { .fg-head { grid-template-columns: 1fr !important; gap: 16px !important; } }`}</style>
    </div>
  </section>
);

const MiniSuggestPreview = () => (
  <div style={{ background: "var(--bg-soft)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, fontSize: 12, color: "var(--muted)" }}>
    <div className="row" style={{ gap: 6, marginBottom: 6 }}>
      <Icon name="sparkles" size={11} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.04em", color: "var(--accent)" }}>SUGGESTION · 5★</span>
    </div>
    <div style={{ color: "var(--ink-2)", lineHeight: 1.5, fontSize: 12 }}>Absolutely loved my visit — the team was friendly and the croissants were…</div>
  </div>
);

const MiniFunnelPreview = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {[100, 78, 58, 22].map((v, i) => (
      <div key={i} style={{ height: 8, width: `${v}%`, borderRadius: 4, background: `linear-gradient(90deg, color-mix(in oklab, var(--accent) ${100 - i*10}%, var(--accent-2)), var(--accent-2))` }} />
    ))}
  </div>
);

const MiniKPIPreview = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
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

const MiniRedirectPreview = () => (
  <div className="row" style={{ gap: 8, fontSize: 12, color: "var(--muted)" }}>
    <div className="row" style={{ gap: 4 }}><Icon name="scan" size={11} /> Scan</div>
    <Icon name="arrow" size={10} />
    <div className="row" style={{ gap: 4 }}><Icon name="sparkles" size={11} /> AI</div>
    <Icon name="arrow" size={10} />
    <div className="row" style={{ gap: 4 }}><Icon name="google" size={11} /> Google</div>
  </div>
);

/* ===== ANALYTICS SHOWCASE ===== */
const AnalyticsShowcase = () => {
  const [animTick, setAnimTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAnimTick(t => t + 1), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 56px" }}>
          <span className="eyebrow"><span className="dot" /> Analytics</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Conversion analytics built for review velocity.</h2>
          <p className="lead" style={{ margin: "16px auto 0" }}>
            Track every QR scan, every rating, every redirect. See where customers drop off and where your best reviews come from.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="an-grid">
          <div className="card" style={{ padding: 28 }}>
            <div className="between" style={{ marginBottom: 18 }}>
              <div>
                <div className="kicker">FUNNEL CONVERSION RATE</div>
                <h4 style={{ margin: "4px 0 0", fontSize: 22, letterSpacing: "-0.01em" }}>Live across 6 locations</h4>
              </div>
              <span className="chip green"><Icon name="arrowUp" size={11} /> +24.6% WoW</span>
            </div>
            <AreaChart key={animTick} data={Array.from({ length: 20 }).map((_, i) => ({
              x: i % 4 === 0 ? `D${i + 1}` : "",
              v: Math.round(40 + Math.sin(i * 0.4) * 18 + i * 2.4 + Math.random() * 8),
            }))} w={780} h={220} />
          </div>
          <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
            <div className="kicker">DEVICE MIX</div>
            <h4 style={{ margin: "4px 0 16px", fontSize: 18 }}>Where reviews come from</h4>
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 16px" }}>
              <Donut data={[
                { v: 612, color: "var(--accent)" },
                { v: 198, color: "var(--accent-2)" },
                { v: 88, color: "#C9C5F4" },
              ]}/>
            </div>
            <div className="col" style={{ gap: 8 }}>
              <RowLegend color="var(--accent)" label="iOS" v="68%" delta="+4%" />
              <RowLegend color="var(--accent-2)" label="Android" v="22%" delta="+1%" />
              <RowLegend color="#C9C5F4" label="Desktop" v="10%" delta="-2%" />
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }} className="an-grid-2">
          <div className="card" style={{ padding: 24 }}>
            <div className="kicker">QR SCAN TRENDS</div>
            <h4 style={{ margin: "4px 0 12px", fontSize: 16 }}>Hour-of-day heatmap</h4>
            <Heatmap />
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="kicker">COUNTRIES</div>
            <h4 style={{ margin: "4px 0 12px", fontSize: 16 }}>Top regions today</h4>
            <div className="col" style={{ gap: 10 }}>
              {[
                { c: "United States", v: 48, flag: "🇺🇸" },
                { c: "India", v: 18, flag: "🇮🇳" },
                { c: "United Kingdom", v: 12, flag: "🇬🇧" },
                { c: "Germany", v: 9, flag: "🇩🇪" },
                { c: "Australia", v: 7, flag: "🇦🇺" },
              ].map((r, i) => (
                <div key={i} className="row" style={{ gap: 10 }}>
                  <span style={{ fontSize: 16, width: 22 }}>{r.flag}</span>
                  <span style={{ fontSize: 13, color: "var(--ink-2)", width: 140 }}>{r.c}</span>
                  <div style={{ flex: 1, height: 6, background: "var(--surface-2)", borderRadius: 4 }}>
                    <div style={{ width: `${r.v * 2}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-2))", borderRadius: 4 }} />
                  </div>
                  <span className="mono" style={{ fontSize: 12, color: "var(--muted)", width: 32, textAlign: "right" }}>{r.v}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div className="kicker">REVIEW VELOCITY</div>
            <h4 style={{ margin: "4px 0 12px", fontSize: 16 }}>Reviews per day</h4>
            <BarChart data={Array.from({ length: 8 }, (_, i) => ({ x: `D${i+1}`, v: 12 + Math.random() * 24 + i * 3 }))} w={420} h={150} />
          </div>
        </div>
        <style>{`
          @media (max-width: 1000px) {
            .an-grid { grid-template-columns: 1fr !important; }
            .an-grid-2 { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
};

const RowLegend = ({ color, label, v, delta }) => (
  <div className="between" style={{ fontSize: 13 }}>
    <div className="row" style={{ gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 3, background: color }} />
      <span style={{ color: "var(--ink-2)" }}>{label}</span>
    </div>
    <div className="row" style={{ gap: 6 }}>
      <span className="mono" style={{ color: "var(--muted)" }}>{v}</span>
      <span style={{ color: delta?.startsWith("-") ? "#B42A1B" : "#117047", fontSize: 11 }}>{delta}</span>
    </div>
  </div>
);

const Heatmap = () => {
  const days = 7, hours = 12;
  const cells = useMemo(() => {
    const arr = [];
    for (let d = 0; d < days; d++) {
      for (let h = 0; h < hours; h++) {
        const peak = Math.exp(-Math.pow((h - 8) / 3, 2)) * (d < 5 ? 1 : 0.7);
        arr.push(peak + Math.random() * 0.2);
      }
    }
    return arr;
  }, []);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${hours}, 1fr)`, gap: 3 }}>
      {cells.map((v, i) => (
        <div key={i} style={{
          aspectRatio: "1 / 1",
          background: `color-mix(in oklab, var(--accent) ${(v * 70).toFixed(0)}%, var(--surface-2))`,
          borderRadius: 3,
        }} />
      ))}
    </div>
  );
};

Object.assign(window, { HomePage, HomeHero, TrustSection, HowItWorks, FeatureGrid, AnalyticsShowcase });
