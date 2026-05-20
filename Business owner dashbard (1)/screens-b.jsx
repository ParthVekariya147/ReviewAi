// screens-b.jsx — Review History, QR Dashboard, QR Request, Analytics

const { useState: useStateB, useEffect: useEffectB, useMemo: useMemoB, useRef: useRefB } = React;

/* ─────────────────────────────────────────────────────────────────────────── */
/* REVIEW HISTORY                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenHistory({ ctx }) {
  const [filter, setFilter] = useStateB("all");
  const [search, setSearch] = useStateB("");

  const allReviews = useMemoB(() => {
    const tones = ["warm", "professional", "casual", "enthusiastic"];
    const customers = ["Customer #4821", "Customer #4820", "Customer #4815", "Customer #4807", "Customer #4801", "Customer #4798", "Customer #4790", "Customer #4783", "Customer #4775", "Customer #4768", "Customer #4762", "Customer #4756"];
    const sources = ["Front Counter", "Table Tents", "Receipts", "Loyalty Email"];
    const devices = ["iPhone 15", "Android", "iPad", "iPhone 14", "Android"];
    const countries = ["🇺🇸 US", "🇨🇦 CA", "🇲🇽 MX", "🇬🇧 UK", "🇫🇷 FR"];
    const langs = ["English","Spanish","French","English","English"];
    const samples = [
      "Wood-fired pizza was incredible — staff made our anniversary feel special. Back soon!",
      "Cozy atmosphere, fast service and the vegan menu was a delightful surprise.",
      "Best Italian in NW Portland — patio at sunset is unmatched.",
      "Service was warm, the espresso was perfect and the tiramisu blew us away.",
      "Family-friendly, the kids loved the bread service. Owner stopped by our table.",
      "Tucked-away neighborhood gem — definitely worth the trip across town.",
      "The seasonal menu rotates often and the chef knows his stuff.",
      "We were celebrating a promotion and the team made it feel like a real occasion.",
      "Cocktails are creative and the food never misses. New favorite spot.",
      "Quiet vibe, great lighting, and the gnocchi is the best in the city.",
      "Walked in without a reservation — they squeezed us in and treated us like regulars.",
      "Patio heaters made winter dinner cozy. Will recommend to anyone.",
    ];

    return Array.from({ length: 24 }, (_, i) => ({
      id: `r-${1000 + i}`,
      customer: customers[i % customers.length],
      text: samples[i % samples.length],
      stars: i % 7 === 3 ? 4 : 5,
      tone: tones[i % tones.length],
      lang: langs[i % langs.length],
      source: sources[i % sources.length],
      device: devices[i % devices.length],
      country: countries[i % countries.length],
      time: `${(i * 17) % 23}h ago`,
      status: i % 11 === 0 ? "submitted" : i % 9 === 0 ? "abandoned" : i % 6 === 0 ? "copied" : "redirected",
      refreshes: (i * 7) % 4,
      copies: (i * 3) % 3,
    }));
  }, []);

  const filtered = allReviews.filter(r =>
    (filter === "all" || r.status === filter) &&
    (!search || r.text.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="lp-page">
      <PageHeader
        title="Review history"
        sub="Every AI-assisted customer review your funnel has produced"
        actions={
          <>
            <window.Btn icon="filter">Filter</window.Btn>
            <window.Btn icon="download">Export CSV</window.Btn>
          </>
        }
      />

      <div className="lp-grid lp-grid-4">
        <window.Stat label="Reviews generated"   icon="sparkles" value={2384}    delta={11.2}  tone="primary"/>
        <window.Stat label="Submitted to Google" icon="external" value={1845}    delta={8.4}   tone="success"/>
        <window.Stat label="Funnel completion"   icon="check"    value={77.4}    suffix="%" decimals={1} delta={3.1} tone="violet"/>
        <window.Stat label="Conversion (scan→Google)" icon="trendUp" value={49.9} suffix="%" decimals={1} delta={5.4} tone="cyan"/>
      </div>

      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
        <window.Stat label="Refresh requests"    icon="refresh"  value={487}     delta={-2.1}  tone="warning"/>
        <window.Stat label="Copy clicks"         icon="copy"     value={892}     delta={4.4}   tone="primary"/>
        <window.Card>
          <window.CardHeader title="Reviews by country" subtitle="Top 5 locations"/>
          <div className="lp-country-list" style={{ gap: 8 }}>
            {[
              { flag: "🇺🇸", name: "US", n: 1742, share: 0.73 },
              { flag: "🇨🇦", name: "CA", n: 308,  share: 0.13 },
              { flag: "🇲🇽", name: "MX", n: 142,  share: 0.06 },
              { flag: "🇬🇧", name: "UK", n: 95,   share: 0.04 },
              { flag: "🌐", name: "Other", n: 97, share: 0.04 },
            ].map(c => (
              <div className="lp-country-row" key={c.name}>
                <span className="lp-country-flag" style={{ fontSize: 14 }}>{c.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 11.5 }}>
                    <span>{c.name}</span>
                    <span><b>{window.fmt(c.n)}</b></span>
                  </div>
                  <window.Progress value={c.share * 100} tone="primary" height={3}/>
                </div>
              </div>
            ))}
          </div>
        </window.Card>
      </div>

      <window.Card padded={false}>
        <div className="lp-table-toolbar">
          <window.Input icon="search" placeholder="Search reviews, customers, content…" value={search} onChange={(e) => setSearch(e.target.value)}/>
          <window.Segmented value={filter} onChange={setFilter} options={[
            { value: "all", label: "All" },
            { value: "redirected", label: "Redirected" },
            { value: "copied", label: "Copied" },
            { value: "submitted", label: "Submitted" },
            { value: "abandoned", label: "Abandoned" },
          ]}/>
          <window.Select value="30d" onChange={() => {}} options={[
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "all", label: "All time" },
          ]}/>
        </div>

        <table className="lp-table lp-table-history">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Review</th>
              <th>★</th>
              <th>Tone · Lang</th>
              <th>Source</th>
              <th>Device · Country</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 14).map(r => (
              <tr key={r.id}>
                <td>
                  <div className="lp-tcell-main">
                    <window.Avatar name={r.customer} size={28}/>
                    <div>
                      <div className="lp-tcell-name">{r.customer}</div>
                      <div className="lp-tcell-sub">
                        {r.refreshes > 0 && <span><window.Icon name="refresh" size={10}/> {r.refreshes}×</span>}
                        {r.copies > 0 && <span style={{ marginLeft: 8 }}><window.Icon name="copy" size={10}/> {r.copies}×</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="lp-tcell-text">{r.text}</td>
                <td><span style={{ color: "var(--lp-warning)" }}>★</span> {r.stars}</td>
                <td>
                  <window.Badge tone="neutral">{r.tone}</window.Badge>{" "}
                  <span className="lp-muted">{r.lang}</span>
                </td>
                <td><span className="lp-muted">{r.source}</span></td>
                <td>
                  <div>{r.device}</div>
                  <div className="lp-muted" style={{ fontSize: 11 }}>{r.country}</div>
                </td>
                <td>
                  <window.Badge tone={
                    r.status === "submitted" ? "success" :
                    r.status === "abandoned" ? "danger" :
                    r.status === "copied" ? "primary" : "violet"
                  } dot>
                    {r.status}
                  </window.Badge>
                </td>
                <td className="lp-muted">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="lp-table-foot">
          <span className="lp-muted">Showing 1–{Math.min(14, filtered.length)} of {filtered.length}</span>
          <div className="lp-flex" style={{ gap: 6 }}>
            <window.Btn variant="ghost" size="sm" icon="chevron" style={{ transform: "scaleX(-1)" }}/>
            <window.Btn variant="ghost" size="sm" iconRight="chevron"/>
          </div>
        </div>
      </window.Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* QR DASHBOARD                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenQR({ ctx }) {
  const { biz, t } = ctx;
  const [selected, setSelected] = useStateB("fc-2k4");

  const campaigns = [
    { id: "fc-2k4",  name: "Front Counter",   url: "loopr.io/r/fc-2k4",  scans: 1284, conv: 0.412, status: "live",   color: "primary" },
    { id: "tt-7j1",  name: "Table Tents",     url: "loopr.io/r/tt-7j1",  scans: 942,  conv: 0.387, status: "live",   color: "violet" },
    { id: "rc-9m2",  name: "Receipts",        url: "loopr.io/r/rc-9m2",  scans: 614,  conv: 0.341, status: "live",   color: "cyan" },
    { id: "le-4p8",  name: "Loyalty Email",   url: "loopr.io/r/le-4p8",  scans: 211,  conv: 0.298, status: "paused", color: "warning" },
    { id: "ev-3k7",  name: "Patio Event",     url: "loopr.io/r/ev-3k7",  scans: 89,   conv: 0.221, status: "draft",  color: "neutral" },
  ];

  const current = campaigns.find(c => c.id === selected);
  const url = `https://${current.url}`;

  return (
    <div className="lp-page">
      <PageHeader
        title="QR codes"
        sub="Generate, customize and track QR campaigns"
        actions={
          <>
            <window.Btn icon="package">Order printed materials</window.Btn>
            <window.Btn variant="primary" icon="plus">New campaign</window.Btn>
          </>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16, alignItems: "start" }}>
        {/* Left: campaign detail */}
        <div className="lp-stack">
          <window.Card>
            <div className="lp-flex" style={{ gap: 28, alignItems: "flex-start" }}>
              <div>
                <div className="lp-qr-frame" style={{ borderColor: `var(--lp-${current.color})` }}>
                  <window.QRCanvas value={url} size={220} color="#0A0B14" bg="#FFFFFF" radius={16}/>
                </div>
                <div className="lp-flex" style={{ gap: 8, marginTop: 12, justifyContent: "center" }}>
                  <window.Btn icon="download" size="sm">PNG</window.Btn>
                  <window.Btn icon="download" size="sm">PDF</window.Btn>
                  <window.Btn icon="download" size="sm">SVG</window.Btn>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="lp-flex lp-flex-between" style={{ marginBottom: 6 }}>
                  <h2 className="lp-h2" style={{ fontSize: 22, margin: 0 }}>{current.name}</h2>
                  <window.Badge tone={current.status === "live" ? "success" : current.status === "paused" ? "warning" : "neutral"} dot>{current.status}</window.Badge>
                </div>
                <div className="lp-flex" style={{ gap: 8, alignItems: "center", marginBottom: 18 }}>
                  <span className="lp-link-pill"><window.Icon name="link" size={12}/> {current.url}</span>
                  <window.Btn variant="ghost" size="sm" icon="copy"/>
                  <window.Btn variant="ghost" size="sm" icon="external"/>
                </div>

                <div className="lp-grid lp-grid-3" style={{ gap: 10, marginBottom: 18 }}>
                  <MicroStat label="Total scans" value={current.scans} icon="qr"/>
                  <MicroStat label="Conversion" value={Math.round(current.conv * 100)} suffix="%" icon="trendUp" tone="success"/>
                  <MicroStat label="Avg. daily" value={Math.round(current.scans / 30)} icon="bars" tone="violet"/>
                </div>

                <window.CardHeader title="Last 14 days" subtitle="Scans per day"/>
                <window.Chart
                  data={window.dayLabels(14).map((x, i) => ({ x, scans: Math.round(current.scans / 30 * (1 + Math.sin(i * 0.7) * 0.4 + Math.random() * 0.3)) }))}
                  keys={["scans"]} colors={[current.color]} kind={t.chartStyle} height={170} yTicks={3}
                />
              </div>
            </div>
          </window.Card>

          {/* Heatmap by hour */}
          <window.Card>
            <window.CardHeader
              title="Scan heatmap"
              subtitle="When customers scan — by day of week × hour"
              action={<window.Btn variant="ghost" size="sm" iconRight="chevronD">This month</window.Btn>}
            />
            <div className="lp-heat-wrap">
              <div className="lp-heat-y">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
              </div>
              <window.Heatmap rows={7} cols={24}
                data={Array.from({ length: 7 * 24 }, (_, i) => {
                  const day = Math.floor(i / 24), hr = i % 24;
                  const peak = (hr >= 11 && hr <= 14) || (hr >= 18 && hr <= 21);
                  const weekend = day >= 5;
                  return Math.round((peak ? 18 : 4) * (weekend ? 1.4 : 1) * (0.6 + Math.random() * 0.8));
                })}
                max={30}
                tone={current.color}
              />
            </div>
            <div className="lp-heat-x">
              {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}:00</span>)}
            </div>
          </window.Card>
        </div>

        {/* Right: campaign list */}
        <div className="lp-stack" style={{ position: "sticky", top: 12 }}>
          <window.Card padded={false}>
            <div style={{ padding: "16px 18px 6px" }}>
              <window.CardHeader title="Campaigns" subtitle={`${campaigns.length} total · ${campaigns.filter(c => c.status === "live").length} live`}/>
            </div>
            <div className="lp-camp-list">
              {campaigns.map(c => (
                <button key={c.id} onClick={() => setSelected(c.id)} className={`lp-camp-row ${selected === c.id ? "is-on" : ""}`}>
                  <div className="lp-camp-thumb" style={{ background: `var(--lp-${c.color}-soft)`, color: `var(--lp-${c.color})` }}>
                    <window.Icon name="qr" size={14}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="lp-camp-name">{c.name}</div>
                    <div className="lp-muted lp-truncate" style={{ fontSize: 11 }}>{c.url}</div>
                  </div>
                  <div className="lp-camp-meta">
                    <div>{window.fmt(c.scans)}</div>
                    <div className="lp-muted" style={{ fontSize: 11 }}>{window.pct(c.conv)}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ padding: "10px 16px 16px" }}>
              <window.Btn variant="ghost" icon="plus" className="lp-block">Create campaign</window.Btn>
            </div>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Dynamic QR" subtitle="One code, swappable destination"/>
            <window.Switch label="Dynamic redirect" sub="Change destination without reprinting" checked={true} onChange={() => {}}/>
            <window.Switch label="Pause campaign" sub="Customers see a friendly fallback" checked={false} onChange={() => {}}/>
            <window.Switch label="Enable A/B testing" sub="Split traffic between funnel variants" checked={false} onChange={() => {}}/>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

function MicroStat({ label, value, suffix, icon, tone = "primary" }) {
  return (
    <div className="lp-microstat">
      <div className="lp-microstat-label"><window.Icon name={icon} size={12}/> {label}</div>
      <div className="lp-microstat-val">
        <window.Counter value={value} suffix={suffix || ""}/>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* QR REQUEST PAGE                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenQRRequest({ ctx }) {
  const { biz, t } = ctx;
  const [name, setName] = useStateB("Sidewalk Sign · NW Portland");
  const [url, setUrl] = useStateB("loopr.io/r/sw-1q4");
  const [color, setColor] = useStateB(biz.color);
  const [bg, setBg] = useStateB("#FFFFFF");
  const [size, setSize] = useStateB(220);
  const [eyeStyle, setEyeStyle] = useStateB("rounded");
  const [format, setFormat] = useStateB("standalone");
  const [orderPrint, setOrderPrint] = useStateB(true);
  const [qty, setQty] = useStateB(50);
  const fullUrl = `https://${url}`;

  return (
    <div className="lp-page">
      <PageHeader
        title="New QR campaign"
        sub="Configure, brand and order your QR materials"
        actions={
          <>
            <window.Btn>Save as draft</window.Btn>
            <window.Btn variant="primary" icon="rocket">Launch campaign</window.Btn>
          </>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        {/* Left: form */}
        <div className="lp-stack">
          <window.Card>
            <window.CardHeader title="Campaign details" eyebrow="Step 1"/>
            <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
              <window.Field label="Campaign name">
                <window.Input value={name} onChange={(e) => setName(e.target.value)} icon="qr"/>
              </window.Field>
              <window.Field label="Slug">
                <window.Input value={url} onChange={(e) => setUrl(e.target.value)} prefix="loopr.io/r/"/>
              </window.Field>
              <window.Field label="Assign to location">
                <window.Select value="nw" onChange={() => {}} options={[
                  { value: "nw", label: "NW Portland" },
                  { value: "se", label: "SE Division" },
                ]}/>
              </window.Field>
              <window.Field label="Funnel variant">
                <window.Select value="default" onChange={() => {}} options={[
                  { value: "default", label: "Default funnel" },
                  { value: "patio", label: "Patio event funnel" },
                ]}/>
              </window.Field>
            </div>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Brand the QR code" eyebrow="Step 2"/>
            <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
              <window.Field label="Foreground color">
                <div className="lp-color-row">
                  {["#0A0B14", "#6366F1", "#8B5CF6", "#0F766E", "#B45309", "#BE123C"].map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`lp-color-sw ${color === c ? "is-on" : ""}`} style={{ background: c }}/>
                  ))}
                </div>
              </window.Field>
              <window.Field label="Background">
                <div className="lp-color-row">
                  {["#FFFFFF", "#FAFAF7", "#FFF6E8", "#ECFDF5", "#EEF2FF"].map(c => (
                    <button key={c} onClick={() => setBg(c)} className={`lp-color-sw ${bg === c ? "is-on" : ""}`} style={{ background: c, border: "1px solid var(--lp-border)" }}/>
                  ))}
                </div>
              </window.Field>
              <window.Field label="Eye style">
                <window.Segmented value={eyeStyle} onChange={setEyeStyle} options={[
                  { value: "rounded", label: "Rounded" },
                  { value: "square", label: "Square" },
                  { value: "leaf", label: "Leaf" },
                ]}/>
              </window.Field>
              <window.Field label="Size" hint={`${size}px`}>
                <input type="range" min="160" max="320" step="10" value={size}
                       onChange={(e) => setSize(Number(e.target.value))} className="lp-range"/>
              </window.Field>
            </div>
            <window.Switch label="Show logo in center" sub="A small mark inside the code" checked={true} onChange={() => {}}/>
            <window.Switch label="Add caption beneath" sub={`"Scan to leave a review · ${biz.name}"`} checked={true} onChange={() => {}}/>
          </window.Card>

          <window.Card>
            <window.CardHeader title="Order physical materials" eyebrow="Step 3 · Optional"/>
            <window.Switch label="Order printed QR materials" sub="We'll print and ship to your business address"
                           checked={orderPrint} onChange={setOrderPrint}/>
            {orderPrint && (
              <>
                <div className="lp-grid lp-grid-2" style={{ marginTop: 14, gap: 10 }}>
                  {[
                    { v: "standalone", label: "Standalone print", price: "$0", sub: "Download PNG/PDF" },
                    { v: "table-tent", label: "Table tents", price: "$1.20/ea", sub: "Foldable cards" },
                    { v: "sticker",    label: "Stickers", price: "$0.40/ea",   sub: "Adhesive vinyl" },
                    { v: "poster",     label: "Wall posters", price: "$3.50/ea", sub: "A4 paper" },
                  ].map(f => (
                    <button key={f.v} onClick={() => setFormat(f.v)} className={`lp-pick lp-pick-h ${format === f.v ? "is-on" : ""}`}>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div className="lp-pick-title">{f.label}</div>
                        <div className="lp-pick-sub">{f.sub}</div>
                      </div>
                      <div className="lp-pick-price">{f.price}</div>
                    </button>
                  ))}
                </div>
                <div className="lp-grid lp-grid-2" style={{ marginTop: 14, gap: 14 }}>
                  <window.Field label="Quantity">
                    <div className="lp-stepper">
                      <button onClick={() => setQty(q => Math.max(10, q - 10))}>−</button>
                      <span><b>{qty}</b></span>
                      <button onClick={() => setQty(q => q + 10)}>+</button>
                    </div>
                  </window.Field>
                  <window.Field label="Estimated delivery">
                    <div className="lp-delivery">
                      <window.Icon name="package" size={16}/>
                      <span>5–7 business days · Free on Pro</span>
                    </div>
                  </window.Field>
                </div>
              </>
            )}
          </window.Card>
        </div>

        {/* Right: live preview */}
        <div className="lp-stack" style={{ position: "sticky", top: 12 }}>
          <window.Card>
            <window.CardHeader title="Live preview" subtitle="Updates as you change settings"/>
            <div className="lp-print-preview" style={{ background: bg }}>
              <div className="lp-print-logo" style={{ background: color }}>O&P</div>
              <div className="lp-print-h" style={{ color }}>Loved your visit?</div>
              <div className="lp-print-sub">Scan to leave a quick review</div>
              <window.QRCanvas value={fullUrl} size={size} color={color} bg={bg} radius={16}/>
              <div className="lp-print-foot">
                <div className="lp-print-biz">{biz.name}</div>
                <div className="lp-print-url">{url}</div>
              </div>
              <div className="lp-print-stars">
                {[1,2,3,4,5].map(i => <span key={i}>★</span>)}
              </div>
            </div>
          </window.Card>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* ANALYTICS                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenAnalytics({ ctx }) {
  const { t } = ctx;
  const days = window.dayLabels(30);
  const scans = window.genSeries(30, 220, 0.35, 0.45);
  const reviews = window.genSeries(30, 75, 0.4, 0.5);
  const redirects = window.genSeries(30, 55, 0.4, 0.55);
  const copies = window.genSeries(30, 38, 0.5, 0.3);
  const refreshes = window.genSeries(30, 22, 0.6, 0.4);
  const seriesMain = days.map((x, i) => ({ x, scans: scans[i], reviews: reviews[i], redirects: redirects[i] }));

  return (
    <div className="lp-page">
      <PageHeader
        title="Analytics"
        sub="Customer review funnel, by the numbers"
        actions={
          <>
            <window.Select value="30d" onChange={() => {}} options={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
            ]}/>
            <window.Btn icon="download">Export</window.Btn>
          </>
        }
      />

      <div className="lp-grid lp-grid-5">
        <window.Stat label="QR scans"        icon="qr"       value={scans.reduce((a,b)=>a+b,0)}     delta={12.4} sparkData={scans.slice(-14)}     tone="primary"/>
        <window.Stat label="Reviews generated" icon="sparkles" value={reviews.reduce((a,b)=>a+b,0)} delta={8.2}  sparkData={reviews.slice(-14)}   tone="violet"/>
        <window.Stat label="Refreshes"       icon="refresh"  value={refreshes.reduce((a,b)=>a+b,0)} delta={-1.4} sparkData={refreshes.slice(-14)} tone="warning"/>
        <window.Stat label="Copy clicks"     icon="copy"     value={copies.reduce((a,b)=>a+b,0)}    delta={6.1}  sparkData={copies.slice(-14)}    tone="cyan"/>
        <window.Stat label="Google redirects" icon="external" value={redirects.reduce((a,b)=>a+b,0)} delta={9.3}  sparkData={redirects.slice(-14)} tone="success"/>
      </div>

      {/* Main combined chart */}
      <window.Card>
        <window.CardHeader
          title="Funnel volume"
          subtitle="Daily scans, reviews and redirects"
          action={
            <window.Segmented value={t.chartStyle} onChange={(v) => ctx.setTweak("chartStyle", v)} options={[
              { value: "area", label: "Area" }, { value: "line", label: "Line" }, { value: "bar", label: "Bar" },
            ]}/>
          }
        />
        <div className="lp-chart-legend">
          <span><i style={{ background: "var(--lp-primary)" }}/>Scans</span>
          <span><i style={{ background: "var(--lp-violet)" }}/>Reviews generated</span>
          <span><i style={{ background: "var(--lp-success)" }}/>Google redirects</span>
        </div>
        <window.Chart data={seriesMain} keys={["scans","reviews","redirects"]} colors={["primary","violet","success"]} kind={t.chartStyle} height={280}/>
      </window.Card>

      {/* Funnel breakdown + conversion */}
      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
        <window.Card>
          <window.CardHeader title="Customer funnel" subtitle="Where customers drop off"/>
          <div className="lp-funnel-viz">
            {[
              { label: "Scanned QR", value: 6580, color: "primary" },
              { label: "Started funnel", value: 5921, color: "violet" },
              { label: "Saw AI suggestion", value: 4855, color: "cyan" },
              { label: "Copied review", value: 3922, color: "warning" },
              { label: "Redirected to Google", value: 3284, color: "success" },
            ].map((s, i, arr) => {
              const width = (s.value / arr[0].value) * 100;
              return (
                <div className="lp-funnel-step" key={s.label}>
                  <div className="lp-funnel-step-label">
                    <span>{s.label}</span>
                    <span><b>{window.fmt(s.value)}</b> <span className="lp-muted">{window.pct(s.value / arr[0].value)}</span></span>
                  </div>
                  <div className="lp-funnel-step-bar" style={{ width: `${width}%`, background: `var(--lp-${s.color})` }}/>
                </div>
              );
            })}
          </div>
        </window.Card>

        <window.Card>
          <window.CardHeader title="Conversion rate" subtitle="Scans → Google redirects"/>
          <div className="lp-flex" style={{ justifyContent: "center", padding: "12px 0" }}>
            <window.Ring value={49.9} max={100} size={140} stroke={12} tone="success"
                         label={<span><window.Counter value={49.9} decimals={1} suffix="%"/></span>}
                         sub="of all scans"/>
          </div>
          <div className="lp-stack" style={{ gap: 8, marginTop: 8 }}>
            <div className="lp-flex lp-flex-between" style={{ fontSize: 12 }}>
              <span className="lp-muted">Industry benchmark</span>
              <span>32%</span>
            </div>
            <div className="lp-flex lp-flex-between" style={{ fontSize: 12 }}>
              <span className="lp-muted">Your best campaign</span>
              <span>61%</span>
            </div>
            <div className="lp-flex lp-flex-between" style={{ fontSize: 12 }}>
              <span className="lp-muted">Trend (30d)</span>
              <span style={{ color: "var(--lp-success)" }}>↑ 5.4%</span>
            </div>
          </div>
        </window.Card>
      </div>

      {/* Device + Country + Top campaigns */}
      <div className="lp-grid lp-grid-3">
        <window.Card>
          <window.CardHeader title="Device breakdown" subtitle="Where customers scan from"/>
          <div className="lp-device-list">
            {[
              { name: "iPhone",   share: 0.58, icon: "smartphone", tone: "primary" },
              { name: "Android",  share: 0.34, icon: "smartphone", tone: "violet" },
              { name: "iPad",     share: 0.05, icon: "tablet",     tone: "cyan" },
              { name: "Desktop",  share: 0.03, icon: "monitor",    tone: "success" },
            ].map(d => (
              <div className="lp-device-row" key={d.name}>
                <span className={`lp-device-icon lp-tone-${d.tone}`}><window.Icon name={d.icon} size={14}/></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
                    <span>{d.name}</span>
                    <span><b>{window.pct(d.share)}</b></span>
                  </div>
                  <window.Progress value={d.share * 100} tone={d.tone} height={4}/>
                </div>
              </div>
            ))}
          </div>
        </window.Card>

        <window.Card>
          <window.CardHeader title="Top countries" subtitle="By customer location"/>
          <div className="lp-country-list">
            {[
              { flag: "🇺🇸", name: "United States", scans: 4821, share: 0.73 },
              { flag: "🇨🇦", name: "Canada",        scans: 832,  share: 0.13 },
              { flag: "🇲🇽", name: "Mexico",        scans: 412,  share: 0.06 },
              { flag: "🇬🇧", name: "United Kingdom",scans: 289,  share: 0.04 },
              { flag: "🇩🇪", name: "Germany",       scans: 121,  share: 0.02 },
              { flag: "🇫🇷", name: "France",        scans: 105,  share: 0.015 },
            ].map(c => (
              <div className="lp-country-row" key={c.name}>
                <span className="lp-country-flag">{c.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
                    <span className="lp-truncate">{c.name}</span>
                    <span>{window.fmt(c.scans)}</span>
                  </div>
                  <window.Progress value={c.share * 100} tone="primary" height={4}/>
                </div>
              </div>
            ))}
          </div>
        </window.Card>

        <window.Card>
          <window.CardHeader title="Top campaigns" subtitle="By conversion"/>
          <div className="lp-stack" style={{ gap: 8 }}>
            {[
              { name: "Front Counter", scans: 1284, conv: 0.61, color: "primary" },
              { name: "Table Tents",   scans: 942,  conv: 0.52, color: "violet" },
              { name: "Receipts",      scans: 614,  conv: 0.44, color: "cyan" },
              { name: "Loyalty Email", scans: 211,  conv: 0.32, color: "warning" },
            ].map(c => (
              <div className="lp-camp-perf" key={c.name}>
                <div className="lp-flex lp-flex-between" style={{ fontSize: 13 }}>
                  <span><b>{c.name}</b></span>
                  <span style={{ color: `var(--lp-${c.color})` }}><b>{window.pct(c.conv)}</b></span>
                </div>
                <div className="lp-flex lp-flex-between" style={{ fontSize: 11, color: "var(--lp-fg-muted)", marginBottom: 4 }}>
                  <span>{window.fmt(c.scans)} scans</span>
                  <span>{Math.round(c.scans * c.conv)} redirects</span>
                </div>
                <window.Progress value={c.conv * 100} tone={c.color} height={6}/>
              </div>
            ))}
          </div>
        </window.Card>
      </div>

      {/* Bottom: hourly heatmap */}
      <window.Card>
        <window.CardHeader title="Scan activity by hour" subtitle="Aggregated across all campaigns this month"/>
        <div className="lp-heat-wrap">
          <div className="lp-heat-y">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
          </div>
          <window.Heatmap rows={7} cols={24}
            data={Array.from({ length: 7 * 24 }, (_, i) => {
              const day = Math.floor(i / 24), hr = i % 24;
              const peak = (hr >= 11 && hr <= 14) || (hr >= 17 && hr <= 21);
              const weekend = day >= 5;
              return Math.round((peak ? 22 : 5) * (weekend ? 1.5 : 1) * (0.5 + Math.random()));
            })}
            max={40}
            tone="primary"
          />
        </div>
        <div className="lp-heat-x">
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{h}:00</span>)}
        </div>
      </window.Card>

      {/* Business impact: revenue contribution + subscription utilization */}
      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 16 }}>
        <window.Card>
          <window.CardHeader
            title="Revenue contribution"
            subtitle="Estimated lift from new Google reviews"
            action={<window.Badge tone="success" icon="trendUp">+18.4% this month</window.Badge>}
          />
          <div className="lp-grid lp-grid-3" style={{ gap: 14, marginBottom: 14 }}>
            <div className="lp-microstat">
              <div className="lp-microstat-label"><window.Icon name="star" size={12}/> Avg. rating lift</div>
              <div className="lp-microstat-val">+0.4 ★</div>
              <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>4.2 → 4.6 since launch</div>
            </div>
            <div className="lp-microstat">
              <div className="lp-microstat-label"><window.Icon name="eye" size={12}/> Search impressions</div>
              <div className="lp-microstat-val">+34%</div>
              <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>local-pack visibility</div>
            </div>
            <div className="lp-microstat">
              <div className="lp-microstat-label"><window.Icon name="card" size={12}/> Estimated revenue lift</div>
              <div className="lp-microstat-val">$8,420</div>
              <div className="lp-muted" style={{ fontSize: 11, marginTop: 2 }}>industry model, last 30d</div>
            </div>
          </div>
          <window.Chart
            data={["Jan","Feb","Mar","Apr","May"].map((x, i) => ({ x, revenue: [3200, 4100, 5400, 6900, 8420][i], reviews: [120, 180, 240, 320, 412][i] }))}
            keys={["revenue"]} colors={["success"]} kind="area" height={140} yTicks={3}
            formatY={(v) => `$${(v/1000).toFixed(1)}k`}
          />
          <div className="lp-muted" style={{ fontSize: 11.5, marginTop: 8 }}>
            Modeled from industry benchmarks: +1 review ≈ +0.4% local conversion · adjust in Settings → Analytics
          </div>
        </window.Card>

        <window.Card>
          <window.CardHeader title="Subscription utilization" subtitle="Pro plan · this month"/>
          <div className="lp-flex" style={{ justifyContent: "center", padding: "4px 0 14px" }}>
            <window.Ring value={51.4} max={100} size={120} stroke={11} tone="primary"
                         label={<span><window.Counter value={51.4} decimals={1} suffix="%"/></span>}
                         sub="of quota"/>
          </div>
          <div className="lp-stack" style={{ gap: 10 }}>
            <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5 }}>
              <span className="lp-muted">Reviews</span>
              <span><b>1,284</b> <span className="lp-muted">/ 2,500</span></span>
            </div>
            <window.Progress value={1284} max={2500} tone="primary" height={5}/>
            <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5, marginTop: 4 }}>
              <span className="lp-muted">Campaigns</span>
              <span><b>4</b> <span className="lp-muted">/ 10</span></span>
            </div>
            <window.Progress value={4} max={10} tone="violet" height={5}/>
            <div className="lp-flex lp-flex-between" style={{ fontSize: 12.5, marginTop: 4 }}>
              <span className="lp-muted">Locations</span>
              <span><b>2</b> <span className="lp-muted">/ 5</span></span>
            </div>
            <window.Progress value={2} max={5} tone="cyan" height={5}/>
          </div>
        </window.Card>
      </div>
    </div>
  );
}

Object.assign(window, { ScreenHistory, ScreenQR, ScreenQRRequest, ScreenAnalytics });
