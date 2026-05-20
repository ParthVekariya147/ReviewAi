// screens-a.jsx — Dashboard Home, Business Onboarding, Business Profile, Funnel Manager
// Uses globals defined in components.jsx and app.jsx (BUSINESS, etc.)

const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useMemo: useMemoA } = React;

/* ─────────────────────────────────────────────────────────────────────────── */
/* DASHBOARD HOME                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenDashboard({ ctx }) {
  const { biz, nav, t } = ctx;
  const days = window.dayLabels(30);
  const scans = window.genSeries(30, 220, 0.35, 0.4);
  const reviews = window.genSeries(30, 36, 0.4, 0.55);
  const redirects = window.genSeries(30, 22, 0.4, 0.5);

  const series = days.map((x, i) => ({ x, scans: scans[i], reviews: reviews[i], redirects: redirects[i] }));

  const totalScans = scans.reduce((a, b) => a + b, 0);
  const totalReviews = reviews.reduce((a, b) => a + b, 0);
  const totalRedirects = redirects.reduce((a, b) => a + b, 0);
  const conversion = totalRedirects / totalScans;

  const recent = [
    { who: "Customer #4821", what: "submitted a 5★ review", when: "2 min ago", icon: "star", tone: "success" },
    { who: "QR · Front Counter", what: "scanned 14 times", when: "8 min ago", icon: "qr", tone: "primary" },
    { who: "Customer #4820", what: "redirected to Google", what2: "via funnel", when: "11 min ago", icon: "external", tone: "primary" },
    { who: "Funnel A", what: "conversion ↑ 4.2%", when: "32 min ago", icon: "trendUp", tone: "success" },
    { who: "Customer #4815", what: "refreshed AI suggestion 2×", when: "1 hr ago", icon: "refresh", tone: "neutral" },
    { who: "QR · Table 6", what: "scanned 3 times", when: "1 hr ago", icon: "qr", tone: "primary" },
  ];

  const campaigns = [
    { name: "Front Counter", code: "loopr.io/r/fc-2k4", scans: 1284, conv: 0.412, status: "live" },
    { name: "Table Tents", code: "loopr.io/r/tt-7j1", scans: 942, conv: 0.387, status: "live" },
    { name: "Receipts", code: "loopr.io/r/rc-9m2", scans: 614, conv: 0.341, status: "live" },
    { name: "Loyalty Email", code: "loopr.io/r/le-4p8", scans: 211, conv: 0.298, status: "paused" },
  ];

  return (
    <div className="lp-page">
      <PageHeader
        title={`Welcome back, ${biz.owner.split(" ")[0]}`}
        sub={`Here's how ${biz.name} is performing — last 30 days`}
        actions={
          <>
            <window.Btn icon="qr" onClick={() => nav("qr")}>New QR campaign</window.Btn>
            <window.Btn variant="primary" icon="sparkles" onClick={() => nav("funnel")}>Open funnel</window.Btn>
          </>
        }
      />

      {/* Top stat row */}
      <div className="lp-grid lp-grid-4">
        <window.Stat label="QR scans"        icon="qr"       value={totalScans}     delta={12.4} sparkData={scans.slice(-12)}     tone="primary"/>
        <window.Stat label="Reviews generated" icon="sparkles" value={totalReviews}  delta={8.2}  sparkData={reviews.slice(-12)}   tone="violet"/>
        <window.Stat label="Google redirects" icon="external" value={totalRedirects} delta={5.7}  sparkData={redirects.slice(-12)} tone="cyan"/>
        <window.Stat label="Funnel conversion" icon="funnel" value={conversion * 100} suffix="%" decimals={1} delta={2.1} sparkData={reviews.map((r, i) => r / scans[i])} tone="success"/>
      </div>

      {/* Main chart + sub stats */}
      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16 }}>
        <window.Card>
          <window.CardHeader
            title="Funnel performance"
            subtitle="QR scans, reviews generated & redirects sent to Google"
            action={
              <div className="lp-flex" style={{ gap: 8 }}>
                <window.Segmented value={t.chartStyle} onChange={(v) => ctx.setTweak("chartStyle", v)}
                                  options={[{value:"area",label:"Area"},{value:"line",label:"Line"},{value:"bar",label:"Bar"}]}/>
                <window.Select value="30d" onChange={() => {}}
                               options={[{value:"7d",label:"7 days"},{value:"30d",label:"30 days"},{value:"90d",label:"90 days"}]}/>
              </div>
            }
          />
          <div className="lp-chart-legend">
            <span><i style={{ background: "var(--lp-primary)" }}/>Scans</span>
            <span><i style={{ background: "var(--lp-violet)" }}/>Reviews</span>
            <span><i style={{ background: "var(--lp-cyan)" }}/>Redirects</span>
          </div>
          <window.Chart
            data={series}
            keys={["scans", "reviews", "redirects"]}
            colors={["primary", "violet", "cyan"]}
            kind={t.chartStyle}
            height={260}
          />
        </window.Card>

        <div className="lp-stack">
          <window.Card>
            <window.CardHeader title="Subscription usage" subtitle="Pro plan · resets Jun 1"/>
            <div className="lp-stack" style={{ gap: 14, marginTop: 4 }}>
              <UsageRow label="Reviews generated" value={1284} max={2500} tone="primary"/>
              <UsageRow label="QR scans tracked"  value={3050} max={10000} tone="violet"/>
              <UsageRow label="Active campaigns"  value={4} max={10} tone="cyan"/>
            </div>
            <div className="lp-divider"/>
            <window.Btn variant="ghost" icon="card" iconRight="chevron" onClick={() => nav("billing")} className="lp-block">
              Manage billing
            </window.Btn>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Refresh & copy counts" subtitle="Customer engagement signals"/>
            <div className="lp-mini-stats">
              <div>
                <div className="lp-mini-label"><window.Icon name="refresh" size={12}/> Refreshes</div>
                <div className="lp-mini-value"><window.Counter value={487}/></div>
                <div className="lp-mini-sub">avg <b>1.4</b> per session</div>
              </div>
              <div>
                <div className="lp-mini-label"><window.Icon name="copy" size={12}/> Copy clicks</div>
                <div className="lp-mini-value"><window.Counter value={892}/></div>
                <div className="lp-mini-sub"><b>91%</b> of completed funnels</div>
              </div>
            </div>
          </window.Card>
        </div>
      </div>

      {/* Active campaigns + recent activity */}
      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 16 }}>
        <window.Card padded={false}>
          <div style={{ padding: "18px 22px 0" }}>
            <window.CardHeader
              title="Active QR campaigns"
              subtitle="Top performing funnels right now"
              action={<window.Btn variant="ghost" iconRight="chevron" size="sm" onClick={() => nav("qr")}>View all</window.Btn>}
            />
          </div>
          <table className="lp-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th className="lp-num">Scans</th>
                <th className="lp-num">Conv.</th>
                <th>Trend</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={c.name}>
                  <td>
                    <div className="lp-tcell-main">
                      <div className="lp-qr-thumb" style={{ background: `linear-gradient(135deg, var(--lp-${["primary","violet","cyan","success"][i]}) 0%, var(--lp-${["violet","cyan","success","primary"][i]}) 100%)` }}>
                        <window.Icon name="qr" size={14}/>
                      </div>
                      <div>
                        <div className="lp-tcell-name">{c.name}</div>
                        <div className="lp-tcell-sub">{c.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="lp-num">{window.fmt(c.scans)}</td>
                  <td className="lp-num"><b>{window.pct(c.conv)}</b></td>
                  <td style={{ width: 100 }}>
                    <window.Sparkline data={window.genSeries(12, 100, 0.5, 0.4)} height={22} tone={["primary","violet","cyan","success"][i]} fill={false}/>
                  </td>
                  <td><window.Badge tone={c.status === "live" ? "success" : "neutral"} dot>{c.status}</window.Badge></td>
                  <td><window.Btn variant="ghost" icon="more" size="sm"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </window.Card>

        <window.Card>
          <window.CardHeader title="Recent activity" subtitle="Latest events from your funnel"/>
          <div className="lp-activity">
            {recent.map((r, i) => (
              <div className="lp-activity-row" key={i}>
                <span className={`lp-activity-icon lp-tone-${r.tone}`}><window.Icon name={r.icon} size={13}/></span>
                <div className="lp-activity-body">
                  <div><b>{r.who}</b> {r.what} {r.what2 && <span className="lp-muted">{r.what2}</span>}</div>
                  <div className="lp-activity-time">{r.when}</div>
                </div>
              </div>
            ))}
          </div>
        </window.Card>
      </div>

      {/* Quick actions */}
      <window.Card>
        <window.CardHeader title="Quick actions"/>
        <div className="lp-quick">
          <QuickAction icon="qr" title="Generate QR code" sub="Download PNG or PDF" onClick={() => nav("qr")}/>
          <QuickAction icon="funnel" title="Edit funnel" sub="Customize the customer flow" onClick={() => nav("funnel")} accent="violet"/>
          <QuickAction icon="bars" title="View analytics" sub="Drill into scan data" onClick={() => nav("analytics")} accent="cyan"/>
          <QuickAction icon="team" title="Invite teammate" sub="Give staff dashboard access" onClick={() => nav("settings")} accent="success"/>
        </div>
      </window.Card>
    </div>
  );
}

function PageHeader({ title, sub, actions, eyebrow }) {
  return (
    <div className="lp-page-hd">
      <div>
        {eyebrow && <div className="lp-eyebrow">{eyebrow}</div>}
        <h1 className="lp-h1">{title}</h1>
        {sub && <div className="lp-page-sub">{sub}</div>}
      </div>
      {actions && <div className="lp-page-act">{actions}</div>}
    </div>
  );
}

function UsageRow({ label, value, max, tone }) {
  return (
    <div>
      <div className="lp-flex lp-flex-between" style={{ marginBottom: 6, fontSize: 12.5 }}>
        <span style={{ color: "var(--lp-fg-muted)" }}>{label}</span>
        <span><b>{window.fmt(value)}</b> <span className="lp-muted">/ {window.fmt(max)}</span></span>
      </div>
      <window.Progress value={value} max={max} tone={tone}/>
    </div>
  );
}

function QuickAction({ icon, title, sub, onClick, accent = "primary" }) {
  return (
    <button className="lp-quick-btn" onClick={onClick}>
      <span className={`lp-quick-icon lp-tone-${accent}`}><window.Icon name={icon} size={18}/></span>
      <div>
        <div className="lp-quick-title">{title}</div>
        <div className="lp-quick-sub">{sub}</div>
      </div>
      <window.Icon name="chevron" size={15} className="lp-quick-chev"/>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ONBOARDING                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenOnboarding({ ctx }) {
  const [step, setStep] = useStateA(0);
  const [data, setData] = useStateA({
    name: "Olive & Pine Bistro",
    industry: "Restaurant",
    address: "1245 Northbound Ave, Portland OR",
    googleUrl: "https://g.page/r/oliveandpine/review",
    primary: "#6366F1",
    plan: "pro",
    funnelStyle: "elegant",
  });

  const steps = [
    { key: "details",  label: "Business details", icon: "building" },
    { key: "industry", label: "Industry",          icon: "shop" },
    { key: "google",   label: "Google review",     icon: "link" },
    { key: "brand",    label: "Branding",          icon: "sparkles" },
    { key: "qr",       label: "QR request",        icon: "qr" },
    { key: "funnel",   label: "Funnel",            icon: "funnel" },
    { key: "plan",     label: "Choose plan",       icon: "card" },
  ];

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));

  return (
    <div className="lp-page lp-onboarding">
      <div className="lp-onb-stepper">
        {steps.map((s, i) => (
          <button key={s.key} className={`lp-onb-step ${i === step ? "is-on" : ""} ${i < step ? "is-done" : ""}`} onClick={() => setStep(i)}>
            <span className="lp-onb-step-num">
              {i < step ? <window.Icon name="check" size={14}/> : i + 1}
            </span>
            <div className="lp-onb-step-text">
              <div className="lp-onb-step-label">{s.label}</div>
              <div className="lp-onb-step-sub">Step {i + 1}</div>
            </div>
          </button>
        ))}
      </div>

      <window.Card className="lp-onb-card">
        {/* progress */}
        <div className="lp-onb-progress">
          <div className="lp-onb-progress-bar" style={{ width: `${((step + 1) / steps.length) * 100}%` }}/>
        </div>

        <div className="lp-onb-body">
          {step === 0 && <StepDetails data={data} set={set}/>}
          {step === 1 && <StepIndustry data={data} set={set}/>}
          {step === 2 && <StepGoogle data={data} set={set}/>}
          {step === 3 && <StepBrand data={data} set={set}/>}
          {step === 4 && <StepQRRequest data={data} set={set}/>}
          {step === 5 && <StepFunnelChoice data={data} set={set}/>}
          {step === 6 && <StepPlan data={data} set={set}/>}
        </div>

        <div className="lp-onb-foot">
          <window.Btn variant="ghost" icon="chevron" onClick={back} disabled={step === 0} style={{ transform: "scaleX(-1)" }}/>
          <div className="lp-muted">Step {step + 1} of {steps.length}</div>
          {step < steps.length - 1
            ? <window.Btn variant="primary" iconRight="chevron" onClick={next}>Continue</window.Btn>
            : <window.Btn variant="primary" icon="check" onClick={() => ctx.nav("dashboard")}>Finish setup</window.Btn>}
        </div>
      </window.Card>
    </div>
  );
}

function StepDetails({ data, set }) {
  return (
    <div>
      <h2 className="lp-h2">Tell us about your business</h2>
      <p className="lp-page-sub">We'll use these details to personalize your customer review funnel.</p>
      <div className="lp-grid lp-grid-2" style={{ marginTop: 22 }}>
        <window.Field label="Business name">
          <window.Input value={data.name} onChange={(e) => set("name", e.target.value)} icon="building"/>
        </window.Field>
        <window.Field label="Owner">
          <window.Input defaultValue="Maya Okafor" icon="user"/>
        </window.Field>
        <window.Field label="Address" hint="Used for location-based analytics">
          <window.Input value={data.address} onChange={(e) => set("address", e.target.value)} icon="globe"/>
        </window.Field>
        <window.Field label="Email">
          <window.Input defaultValue="maya@oliveandpine.co" icon="mail"/>
        </window.Field>
        <window.Field label="Phone">
          <window.Input defaultValue="(503) 555-0182" prefix="+1"/>
        </window.Field>
        <window.Field label="Website">
          <window.Input defaultValue="oliveandpine.co" prefix="https://"/>
        </window.Field>
      </div>
    </div>
  );
}

function StepIndustry({ data, set }) {
  const options = [
    { v: "Restaurant", icon: "shop",     sub: "Dining, cafés, bars" },
    { v: "Salon",      icon: "sparkles", sub: "Hair, beauty, spa" },
    { v: "Clinic",     icon: "shield",   sub: "Dental, medical" },
    { v: "Retail",     icon: "package",  sub: "Stores, boutiques" },
    { v: "Service",    icon: "cog",      sub: "Repair, cleaning" },
    { v: "Hospitality",icon: "building", sub: "Hotels, lodging" },
  ];
  return (
    <div>
      <h2 className="lp-h2">What kind of business?</h2>
      <p className="lp-page-sub">We'll tune review tone, suggested phrasing, and funnel templates to your category.</p>
      <div className="lp-grid lp-grid-3" style={{ marginTop: 22, gap: 12 }}>
        {options.map(o => (
          <button key={o.v} onClick={() => set("industry", o.v)}
                  className={`lp-pick ${data.industry === o.v ? "is-on" : ""}`}>
            <span className="lp-pick-icon"><window.Icon name={o.icon} size={20}/></span>
            <div className="lp-pick-title">{o.v}</div>
            <div className="lp-pick-sub">{o.sub}</div>
            {data.industry === o.v && <span className="lp-pick-check"><window.Icon name="check" size={12}/></span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepGoogle({ data, set }) {
  const ok = data.googleUrl && data.googleUrl.includes("g.page");
  return (
    <div>
      <h2 className="lp-h2">Connect your Google review link</h2>
      <p className="lp-page-sub">Customers who complete the funnel are redirected here to publish their review on Google.</p>
      <div style={{ marginTop: 22, maxWidth: 620 }}>
        <window.Field label="Google review URL" hint="Find this in your Google Business profile → Get more reviews">
          <window.Input value={data.googleUrl} onChange={(e) => set("googleUrl", e.target.value)} icon="link"/>
        </window.Field>
        <div className={`lp-connect-status ${ok ? "is-ok" : ""}`}>
          <span className="lp-connect-status-icon">
            <window.Icon name={ok ? "check" : "globe"} size={14}/>
          </span>
          <div>
            <div className="lp-connect-status-title">
              {ok ? "Connected — Olive & Pine Bistro" : "Validating link…"}
            </div>
            <div className="lp-connect-status-sub">
              {ok ? "4.6 ★ · 1,284 reviews on Google" : "Paste your shareable review link above"}
            </div>
          </div>
          {ok && <window.Badge tone="success" dot>Verified</window.Badge>}
        </div>
      </div>
    </div>
  );
}

function StepBrand({ data, set }) {
  const colors = ["#6366F1", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#0F172A"];
  return (
    <div>
      <h2 className="lp-h2">Add your branding</h2>
      <p className="lp-page-sub">Show your logo and brand color on the customer review funnel.</p>
      <div className="lp-grid lp-grid-2" style={{ marginTop: 22, gap: 22 }}>
        <div>
          <window.Field label="Logo">
            <div className="lp-upload">
              <div className="lp-upload-logo" style={{ background: data.primary }}>O&P</div>
              <div>
                <div className="lp-upload-title">olive-pine-logo.svg</div>
                <div className="lp-upload-sub">512×512 · uploaded just now</div>
              </div>
              <window.Btn variant="ghost" size="sm" icon="upload">Replace</window.Btn>
            </div>
          </window.Field>
          <window.Field label="Brand color">
            <div className="lp-color-row">
              {colors.map(c => (
                <button key={c} onClick={() => set("primary", c)}
                        className={`lp-color-sw ${data.primary === c ? "is-on" : ""}`}
                        style={{ background: c }}/>
              ))}
            </div>
          </window.Field>
          <window.Field label="Greeting message">
            <window.Input defaultValue="Thanks for visiting Olive & Pine — would you share your experience?"/>
          </window.Field>
        </div>
        <div>
          <div className="lp-brand-preview-label">Live preview</div>
          <div className="lp-phone">
            <FunnelMockup brand={{ name: data.name, color: data.primary }} step="landing"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepQRRequest({ data, set }) {
  const formats = [
    { v: "table-tent", label: "Table tents", sub: "Foldable card for tables", icon: "package" },
    { v: "sticker",    label: "Counter sticker", sub: "Adhesive for counters", icon: "dot" },
    { v: "poster",     label: "Wall poster",  sub: "A4 print-ready",          icon: "monitor" },
    { v: "receipt",    label: "Receipt logo", sub: "Embed in POS receipts",   icon: "card" },
  ];
  const [sel, setSel] = useStateA(["table-tent", "sticker"]);
  const toggle = (v) => setSel(s => s.includes(v) ? s.filter(x => x !== v) : [...s, v]);
  return (
    <div>
      <h2 className="lp-h2">Request your physical QR materials</h2>
      <p className="lp-page-sub">We'll print and ship branded QR materials to your address. Free with Pro & Scale plans.</p>
      <div className="lp-grid lp-grid-2" style={{ marginTop: 22, gap: 12 }}>
        {formats.map(f => (
          <button key={f.v} onClick={() => toggle(f.v)}
                  className={`lp-pick lp-pick-h ${sel.includes(f.v) ? "is-on" : ""}`}>
            <span className="lp-pick-icon"><window.Icon name={f.icon} size={20}/></span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div className="lp-pick-title">{f.label}</div>
              <div className="lp-pick-sub">{f.sub}</div>
            </div>
            <span className={`lp-check-box ${sel.includes(f.v) ? "is-on" : ""}`}>
              {sel.includes(f.v) && <window.Icon name="check" size={12}/>}
            </span>
          </button>
        ))}
      </div>
      <div className="lp-callout" style={{ marginTop: 18 }}>
        <window.Icon name="package" size={16}/>
        <div>
          <div><b>Shipping</b> · arrives in 5–7 business days</div>
          <div className="lp-muted">Or skip and use digital QR codes immediately from the QR dashboard.</div>
        </div>
        <window.Btn variant="ghost" size="sm">Skip for now</window.Btn>
      </div>
    </div>
  );
}

function StepFunnelChoice({ data, set }) {
  const opts = [
    { v: "elegant",  label: "Elegant",  sub: "Refined, neutral palette" },
    { v: "vivid",    label: "Vivid",    sub: "Bold gradients and color" },
    { v: "minimal",  label: "Minimal",  sub: "Whitespace, type-first" },
    { v: "playful",  label: "Playful",  sub: "Rounded, warm, friendly" },
  ];
  return (
    <div>
      <h2 className="lp-h2">Choose your funnel style</h2>
      <p className="lp-page-sub">This is what customers see after scanning. You can fully customize later.</p>
      <div className="lp-grid lp-grid-4" style={{ marginTop: 22, gap: 12 }}>
        {opts.map(o => (
          <button key={o.v} onClick={() => set("funnelStyle", o.v)}
                  className={`lp-funnel-pick ${data.funnelStyle === o.v ? "is-on" : ""}`}>
            <div className={`lp-funnel-mini lp-funnel-mini-${o.v}`}>
              <div className="lp-funnel-mini-logo"/>
              <div className="lp-funnel-mini-bar"/>
              <div className="lp-funnel-mini-bar short"/>
              <div className="lp-funnel-mini-btn"/>
            </div>
            <div className="lp-pick-title" style={{ marginTop: 12 }}>{o.label}</div>
            <div className="lp-pick-sub">{o.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPlan({ data, set }) {
  const plans = [
    { v: "starter", name: "Starter", price: 19, sub: "For new businesses", quota: "250 reviews / mo", features: ["1 location","Basic analytics","Email support"], primary: false },
    { v: "pro",     name: "Pro",     price: 49, sub: "Most popular",       quota: "2,500 reviews / mo", features: ["5 locations","Funnel A/B testing","Branded QR materials","Priority support"], primary: true, badge: "Most popular" },
    { v: "scale",   name: "Scale",   price: 149, sub: "Multi-location",    quota: "Unlimited reviews", features: ["Unlimited locations","Custom domain","Team accounts","Dedicated CSM"], primary: false },
  ];
  return (
    <div>
      <h2 className="lp-h2">Choose your plan</h2>
      <p className="lp-page-sub">14-day free trial. Cancel anytime. All prices billed monthly.</p>
      <div className="lp-grid lp-grid-3" style={{ marginTop: 22, gap: 14 }}>
        {plans.map(p => (
          <button key={p.v} onClick={() => set("plan", p.v)}
                  className={`lp-plan ${data.plan === p.v ? "is-on" : ""} ${p.primary ? "lp-plan-primary" : ""}`}>
            {p.badge && <span className="lp-plan-badge">{p.badge}</span>}
            <div className="lp-plan-name">{p.name}</div>
            <div className="lp-plan-sub">{p.sub}</div>
            <div className="lp-plan-price">
              <span className="lp-plan-amt">${p.price}</span>
              <span className="lp-plan-per">/ month</span>
            </div>
            <div className="lp-plan-quota">{p.quota}</div>
            <ul className="lp-plan-feats">
              {p.features.map(f => <li key={f}><window.Icon name="check" size={13}/>{f}</li>)}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* BUSINESS PROFILE                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenProfile({ ctx }) {
  const { biz } = ctx;
  return (
    <div className="lp-page">
      <PageHeader
        title="Business profile"
        sub="Public details, branding & customer-facing identity"
        actions={<window.Btn variant="primary" icon="check">Save changes</window.Btn>}
      />

      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 360px", gap: 16 }}>
        <div className="lp-stack">
          <window.Card>
            <window.CardHeader title="Identity"/>
            <div className="lp-flex" style={{ gap: 18, alignItems: "center" }}>
              <div className="lp-logo-big" style={{ background: biz.color }}>O&P</div>
              <div style={{ flex: 1 }}>
                <window.Field label="Business name">
                  <window.Input defaultValue={biz.name}/>
                </window.Field>
              </div>
            </div>
            <div className="lp-grid lp-grid-2" style={{ marginTop: 14 }}>
              <window.Field label="Industry"><window.Select value={biz.industry} options={["Restaurant","Salon","Clinic","Retail","Service","Hospitality"]} onChange={() => {}}/></window.Field>
              <window.Field label="Founded"><window.Input defaultValue="2019"/></window.Field>
              <window.Field label="Owner"><window.Input defaultValue={biz.owner}/></window.Field>
              <window.Field label="Public email"><window.Input defaultValue="hello@oliveandpine.co"/></window.Field>
            </div>
            <window.Field label="Tagline" hint="Shown on the funnel landing page">
              <window.Input defaultValue="Wood-fired comfort food, Portland's NW neighborhood since 2019."/>
            </window.Field>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Locations" action={<window.Btn variant="ghost" icon="plus" size="sm">Add location</window.Btn>}/>
            <div className="lp-loc-list">
              {[
                { name: "NW Portland", addr: "1245 Northbound Ave, Portland OR 97210", rating: 4.6, reviews: 1284, primary: true },
                { name: "SE Division", addr: "3820 SE Division St, Portland OR 97202", rating: 4.5, reviews: 612, primary: false },
              ].map((l, i) => (
                <div className="lp-loc-row" key={i}>
                  <span className="lp-loc-icon"><window.Icon name="building" size={16}/></span>
                  <div className="lp-loc-body">
                    <div className="lp-loc-name">{l.name} {l.primary && <window.Badge tone="primary">Primary</window.Badge>}</div>
                    <div className="lp-loc-addr">{l.addr}</div>
                  </div>
                  <div className="lp-loc-meta">
                    <window.StarRating value={Math.round(l.rating)} readonly size={14}/>
                    <div className="lp-muted">{l.rating} · {window.fmt(l.reviews)} reviews</div>
                  </div>
                  <window.Btn variant="ghost" icon="more" size="sm"/>
                </div>
              ))}
            </div>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Google review link" subtitle="Used as the destination for completed funnels"/>
            <div className="lp-grid lp-grid-2" style={{ gap: 16 }}>
              <window.Field label="Google review URL">
                <window.Input defaultValue="https://g.page/r/oliveandpine/review" icon="link"/>
              </window.Field>
              <window.Field label="Status">
                <div className="lp-connect-status is-ok" style={{ marginTop: 0 }}>
                  <span className="lp-connect-status-icon"><window.Icon name="check" size={14}/></span>
                  <div>
                    <div className="lp-connect-status-title">Connected</div>
                    <div className="lp-connect-status-sub">4.6 ★ · 1,284 reviews</div>
                  </div>
                </div>
              </window.Field>
            </div>
          </window.Card>
        </div>

        <div className="lp-stack">
          <window.Card>
            <window.CardHeader title="Reputation summary"/>
            <div className="lp-rep-big">
              <div className="lp-rep-big-num">4.6</div>
              <div>
                <window.StarRating value={5} readonly/>
                <div className="lp-muted">across 1,896 reviews</div>
              </div>
            </div>
            <div className="lp-rep-bars">
              {[5,4,3,2,1].map(r => {
                const counts = { 5: 1421, 4: 312, 3: 91, 2: 38, 1: 34 };
                const tone = r >= 4 ? "success" : r === 3 ? "warning" : "danger";
                return (
                  <div className="lp-rep-bar" key={r}>
                    <span className="lp-rep-bar-num">{r}★</span>
                    <window.Progress value={counts[r]} max={1421} tone={tone} height={6}/>
                    <span className="lp-rep-bar-count">{counts[r]}</span>
                  </div>
                );
              })}
            </div>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Branding preview"/>
            <div className="lp-phone" style={{ margin: "0 auto" }}>
              <FunnelMockup brand={biz} step="landing"/>
            </div>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* FUNNEL MANAGER                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenFunnel({ ctx }) {
  const { biz, t } = ctx;
  const [tab, setTab] = useStateA("design");
  const [simStep, setSimStep] = useStateA("landing");
  const [simRunning, setSimRunning] = useStateA(false);

  const [funnel, setFunnel] = useStateA({
    style: t.funnelStyle,
    heading: "Thanks for visiting!",
    sub: "We'd love to hear about your experience.",
    tone: "warm",
    language: "english",
    threshold: 4,
    reviewCount: 3,
  });

  // simulation autoplay
  useEffectA(() => {
    if (!simRunning) return;
    const steps = ["landing", "rate", "generate", "redirect"];
    const i = steps.indexOf(simStep);
    const id = setTimeout(() => {
      const ni = (i + 1) % steps.length;
      setSimStep(steps[ni]);
      if (ni === 0) setSimRunning(false);
    }, 1900);
    return () => clearTimeout(id);
  }, [simRunning, simStep]);

  const updateFunnel = (k, v) => setFunnel(f => ({ ...f, [k]: v }));

  return (
    <div className="lp-page">
      <PageHeader
        title="Customer review funnel"
        sub="Design what customers see after they scan your QR code"
        actions={
          <>
            <window.Btn icon="eye">Preview</window.Btn>
            <window.Btn variant="primary" icon="check">Publish changes</window.Btn>
          </>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 360px", gap: 16, alignItems: "start" }}>
        <window.Card>
          <window.Tabs value={tab} onChange={setTab} tabs={[
            { value: "design", label: "Design" },
            { value: "flow", label: "Customer flow" },
            { value: "ai", label: "AI tone & language" },
            { value: "rules", label: "Routing rules" },
            { value: "analytics", label: "Conversion" },
          ]}/>

          {tab === "design" && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <window.Field label="Funnel style">
                <div className="lp-grid lp-grid-4" style={{ gap: 10 }}>
                  {["elegant","vivid","minimal","playful"].map(s => (
                    <button key={s} onClick={() => updateFunnel("style", s)}
                            className={`lp-funnel-pick ${funnel.style === s ? "is-on" : ""}`} style={{ padding: 10 }}>
                      <div className={`lp-funnel-mini lp-funnel-mini-${s}`} style={{ height: 80 }}>
                        <div className="lp-funnel-mini-logo"/>
                        <div className="lp-funnel-mini-bar"/>
                        <div className="lp-funnel-mini-btn"/>
                      </div>
                      <div className="lp-pick-title" style={{ marginTop: 8, fontSize: 12, textTransform: "capitalize" }}>{s}</div>
                    </button>
                  ))}
                </div>
              </window.Field>
              <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
                <window.Field label="Headline">
                  <window.Input value={funnel.heading} onChange={(e) => updateFunnel("heading", e.target.value)}/>
                </window.Field>
                <window.Field label="Sub-headline">
                  <window.Input value={funnel.sub} onChange={(e) => updateFunnel("sub", e.target.value)}/>
                </window.Field>
                <window.Field label="Primary CTA">
                  <window.Input defaultValue="Rate your visit"/>
                </window.Field>
                <window.Field label="Logo">
                  <window.Input defaultValue="olive-pine-logo.svg" icon="upload"/>
                </window.Field>
              </div>
              <window.Switch label="Show business hours & address" sub="Helps customer recall the visit"
                             checked={true} onChange={() => {}}/>
              <window.Switch label="Show staff signature" sub="Personalize with the staff member's name"
                             checked={false} onChange={() => {}}/>
            </div>
          )}

          {tab === "flow" && (
            <div style={{ marginTop: 16 }}>
              <div className="lp-flow-canvas">
                {["Scan QR", "Rate visit", "AI suggests review", "Customer edits/refreshes", "Redirect to Google"].map((s, i, arr) => (
                  <React.Fragment key={s}>
                    <div className={`lp-flow-node ${i === 2 ? "is-accent" : ""}`}>
                      <div className="lp-flow-num">{i + 1}</div>
                      <div className="lp-flow-name">{s}</div>
                      <div className="lp-flow-stat">
                        <window.Counter value={[3420, 2987, 2455, 2128, 1845][i]}/>
                        <span className="lp-muted"> · {window.pct([1, 2987/3420, 2455/3420, 2128/3420, 1845/3420][i])}</span>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="lp-flow-arrow">
                        <window.Icon name="chevron" size={16}/>
                        <div className="lp-flow-drop">
                          −{Math.round((1 - [2987/3420, 2455/2987, 2128/2455, 1845/2128][i]) * 100)}%
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="lp-callout" style={{ marginTop: 16 }}>
                <window.Icon name="sparkles" size={16}/>
                <div>
                  <div><b>Optimization tip</b> — Add a "skip writing, use suggestion" CTA between steps 3 & 4</div>
                  <div className="lp-muted">Could lift conversion by ~6% based on similar restaurants.</div>
                </div>
                <window.Btn variant="ghost" size="sm">Apply</window.Btn>
              </div>
            </div>
          )}

          {tab === "ai" && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <window.Field label="Default tone preset">
                <div className="lp-grid lp-grid-4" style={{ gap: 8 }}>
                  {["warm", "professional", "casual", "enthusiastic"].map(p => (
                    <button key={p} onClick={() => updateFunnel("tone", p)}
                            className={`lp-tone-pick ${funnel.tone === p ? "is-on" : ""}`}>
                      <div style={{ textTransform: "capitalize", fontWeight: 600 }}>{p}</div>
                      <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>
                        {{warm:"Inviting & friendly", professional:"Polished tone", casual:"Conversational", enthusiastic:"Energetic & glowing"}[p]}
                      </div>
                    </button>
                  ))}
                </div>
              </window.Field>
              <window.Field label="Default language">
                <window.Select value={funnel.language} onChange={(v) => updateFunnel("language", v)}
                               options={["english","spanish","french","german","portuguese","italian","japanese"]}/>
              </window.Field>
              <window.Field label="Number of AI suggestions per customer" hint="More options means higher copy rate but more compute usage">
                <div className="lp-stepper">
                  <button onClick={() => updateFunnel("reviewCount", Math.max(1, funnel.reviewCount - 1))}>−</button>
                  <span><b>{funnel.reviewCount}</b> suggestions</span>
                  <button onClick={() => updateFunnel("reviewCount", Math.min(5, funnel.reviewCount + 1))}>+</button>
                </div>
              </window.Field>
              <window.Field label="Suggested talking points" hint="Topics to weave into AI suggestions">
                <div className="lp-chips">
                  {["wood-fired oven", "neighborhood vibe", "vegan options", "service speed", "patio seating"].map(c => (
                    <span className="lp-chip" key={c}>{c} <window.Icon name="x" size={11}/></span>
                  ))}
                  <button className="lp-chip lp-chip-add"><window.Icon name="plus" size={11}/> Add topic</button>
                </div>
              </window.Field>
              <window.Switch label="Disclose AI assistance to customers" sub="Recommended for Google policy compliance"
                             checked={true} onChange={() => {}}/>
            </div>
          )}

          {tab === "rules" && (
            <div className="lp-stack" style={{ marginTop: 16 }}>
              <window.Field label="QR destination" hint="Where every QR code routes to before the funnel renders">
                <div className="lp-grid lp-grid-2" style={{ gap: 10 }}>
                  <div className="lp-pick is-on lp-pick-h" style={{ cursor: "default" }}>
                    <span className="lp-pick-icon"><window.Icon name="link" size={18}/></span>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div className="lp-pick-title">loopr.io/r/<b>{biz.initials?.toLowerCase() || "op"}-2k4</b></div>
                      <div className="lp-pick-sub">Active for all live campaigns</div>
                    </div>
                    <window.Badge tone="success" dot>Live</window.Badge>
                  </div>
                  <div className="lp-pick lp-pick-h" style={{ cursor: "default" }}>
                    <span className="lp-pick-icon"><window.Icon name="globe" size={18}/></span>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div className="lp-pick-title">reviews.oliveandpine.co</div>
                      <div className="lp-pick-sub">Custom domain · DNS verified</div>
                    </div>
                    <window.Badge tone="primary">CNAME</window.Badge>
                  </div>
                </div>
              </window.Field>
              <window.Field label="Star threshold for Google redirect" hint="Customers below this rating see a private feedback form instead">
                <div className="lp-thresh">
                  <window.StarRating value={funnel.threshold} onChange={(v) => updateFunnel("threshold", v)} size={26}/>
                  <span className="lp-muted">≥ {funnel.threshold} stars → Google</span>
                </div>
              </window.Field>
              <window.Switch label="Capture low ratings privately"
                             sub="Below-threshold customers send feedback directly to the business owner"
                             checked={true} onChange={() => {}}/>
              <window.Switch label="Notify owner on every 5★ review"
                             sub="Push notifications and email"
                             checked={true} onChange={() => {}}/>
              <window.Switch label="Throttle repeat scans"
                             sub="One review per customer device per 30 days"
                             checked={true} onChange={() => {}}/>
            </div>
          )}

          {tab === "analytics" && (
            <div style={{ marginTop: 16 }}>
              <div className="lp-grid lp-grid-4" style={{ marginBottom: 14 }}>
                <window.Stat label="Funnel starts"   icon="qr"       value={3420}  delta={11} tone="primary"/>
                <window.Stat label="Completion"      icon="check"    value={53.9}  suffix="%" decimals={1} delta={4.2} tone="success"/>
                <window.Stat label="Avg. rating"     icon="star"     value={4.6}   decimals={1} delta={0.3} tone="warning"/>
                <window.Stat label="Time on page"    icon="history"  value={48} suffix="s" delta={-3} tone="violet"/>
              </div>
              <window.Chart
                data={window.dayLabels(14).map((x, i) => ({ x, conv: 35 + Math.sin(i * 0.6) * 5 + i * 0.8, target: 50 }))}
                keys={["conv", "target"]}
                colors={["primary", "violet"]}
                kind="line"
                height={220}
                formatY={(v) => `${Math.round(v)}%`}
              />
            </div>
          )}
        </window.Card>

        {/* Right: live preview */}
        <div className="lp-stack" style={{ position: "sticky", top: 12 }}>
          <window.Card>
            <window.CardHeader
              title="Live preview"
              subtitle={`Customer view — ${simStep}`}
              action={
                <window.Btn variant="primary" size="sm" icon={simRunning ? "x" : "play"} onClick={() => { setSimRunning(r => !r); if (!simRunning) setSimStep("landing"); }}>
                  {simRunning ? "Stop" : "Simulate"}
                </window.Btn>
              }
            />
            <div className="lp-phone" style={{ margin: "0 auto" }}>
              <FunnelMockup brand={biz} step={simStep} funnel={funnel}/>
            </div>
            <div className="lp-flex" style={{ gap: 6, marginTop: 14, justifyContent: "center" }}>
              {["landing","rate","generate","redirect"].map(s => (
                <button key={s} className={`lp-step-dot ${simStep === s ? "is-on" : ""}`} onClick={() => setSimStep(s)}>
                  {s}
                </button>
              ))}
            </div>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* FUNNEL MOCKUP (used by Onboarding, Profile, Funnel screens)                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function FunnelMockup({ brand, step = "landing", funnel = {} }) {
  const style = funnel.style || "elegant";
  const heading = funnel.heading || `Thanks for visiting ${brand.name}!`;
  const sub = funnel.sub || "We'd love to hear about your experience.";

  const styleVars = {
    elegant: { bg: "#FAFAF7", fg: "#0F0F12", accent: brand.color, font: "ui-serif, Georgia, serif" },
    vivid:   { bg: "linear-gradient(160deg, " + brand.color + " 0%, #8B5CF6 100%)", fg: "#fff", accent: "#fff", font: "system-ui" },
    minimal: { bg: "#FFFFFF", fg: "#000", accent: "#000", font: "system-ui" },
    playful: { bg: "#FFF6E8", fg: "#3F2E1B", accent: brand.color, font: "system-ui" },
  }[style];

  return (
    <div className="lp-funnel" style={{ background: styleVars.bg, color: styleVars.fg, fontFamily: styleVars.font }}>
      <div className="lp-funnel-head">
        <div className="lp-funnel-logo" style={{ background: styleVars.accent, color: styleVars.bg.includes("gradient") ? brand.color : "#fff" }}>
          {brand.name?.split(" ").map(s => s[0]).slice(0, 2).join("") || "O&P"}
        </div>
        <div className="lp-funnel-biz">{brand.name}</div>
      </div>

      {step === "landing" && (
        <div className="lp-funnel-body">
          <div className="lp-funnel-h">{heading}</div>
          <div className="lp-funnel-sub">{sub}</div>
          <div className="lp-funnel-stars-prompt">
            {[1,2,3,4,5].map(i => <span key={i} className="lp-funnel-star-prompt">★</span>)}
          </div>
          <div className="lp-funnel-cta" style={{ background: styleVars.accent, color: styleVars.bg.includes("gradient") ? brand.color : "#fff" }}>
            Rate your visit
          </div>
        </div>
      )}

      {step === "rate" && (
        <div className="lp-funnel-body">
          <div className="lp-funnel-h" style={{ fontSize: 18 }}>How was it?</div>
          <div className="lp-funnel-stars-big">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="lp-funnel-star-big" style={{ color: i <= 5 ? "#F5A623" : "rgba(0,0,0,0.15)" }}>★</span>
            ))}
          </div>
          <div className="lp-funnel-sub">5 out of 5 — wonderful!</div>
          <div className="lp-funnel-cta" style={{ background: styleVars.accent, color: styleVars.bg.includes("gradient") ? brand.color : "#fff" }}>
            Continue
          </div>
        </div>
      )}

      {step === "generate" && (
        <div className="lp-funnel-body" style={{ paddingTop: 14 }}>
          <div className="lp-funnel-h" style={{ fontSize: 16 }}>Pick what fits your visit</div>
          {[
            "The wood-fired pizza was incredible and the staff made our anniversary feel special. Will be back soon!",
            "Cozy atmosphere, fast service and the vegan menu was a delightful surprise. Highly recommend.",
            "Best Italian in NW Portland — every dish was wonderful and the patio is a vibe at sunset.",
          ].map((r, i) => (
            <div className="lp-funnel-review" key={i} style={{ borderColor: i === 1 ? styleVars.accent : "rgba(0,0,0,0.08)" }}>
              <div className="lp-funnel-review-text">{r}</div>
              <div className="lp-funnel-review-acts">
                <span><window.Icon name="refresh" size={11}/> Refresh</span>
                <span><window.Icon name="copy" size={11}/> Copy</span>
              </div>
            </div>
          ))}
          <div className="lp-funnel-cta" style={{ background: styleVars.accent, color: styleVars.bg.includes("gradient") ? brand.color : "#fff" }}>
            Post to Google
          </div>
        </div>
      )}

      {step === "redirect" && (
        <div className="lp-funnel-body" style={{ textAlign: "center", padding: "24px 16px" }}>
          <div className="lp-funnel-redirect-icon">
            <window.Icon name="external" size={24}/>
          </div>
          <div className="lp-funnel-h" style={{ fontSize: 18 }}>Opening Google…</div>
          <div className="lp-funnel-sub">Paste your review and hit Post. Thanks!</div>
          <div className="lp-google-card">
            <div className="lp-google-g">G</div>
            <div>
              <div style={{ fontWeight: 600 }}>Olive & Pine Bistro</div>
              <div className="lp-muted" style={{ fontSize: 11 }}>Write a review</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ScreenDashboard, ScreenOnboarding, ScreenProfile, ScreenFunnel, PageHeader, FunnelMockup });
