// screens-c.jsx — Billing, Usage, Notifications, Settings

const { useState: useStateC, useEffect: useEffectC } = React;

/* ─────────────────────────────────────────────────────────────────────────── */
/* SUBSCRIPTION & BILLING                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenBilling({ ctx }) {
  const [billing, setBilling] = useStateC("monthly");

  const plans = [
    { v: "starter", name: "Starter", price: { monthly: 19, yearly: 16 }, sub: "For new businesses", quota: "250 reviews / mo", features: ["1 location","Basic analytics","Email support","Branded funnel"] },
    { v: "pro",     name: "Pro",     price: { monthly: 49, yearly: 39 }, sub: "Most popular",       quota: "2,500 reviews / mo", features: ["5 locations","Funnel A/B testing","Branded QR materials","Priority support","Custom tones"], badge: "Current plan", current: true },
    { v: "scale",   name: "Scale",   price: { monthly: 149, yearly: 119 }, sub: "Multi-location",    quota: "Unlimited reviews", features: ["Unlimited locations","Custom domain","Team accounts","Dedicated CSM","API access"] },
  ];

  const invoices = [
    { id: "INV-2026-05-001", date: "May 1, 2026",  amount: 49, status: "paid",    period: "May 2026" },
    { id: "INV-2026-04-001", date: "Apr 1, 2026",  amount: 49, status: "paid",    period: "Apr 2026" },
    { id: "INV-2026-03-001", date: "Mar 1, 2026",  amount: 49, status: "paid",    period: "Mar 2026" },
    { id: "INV-2026-02-001", date: "Feb 1, 2026",  amount: 49, status: "paid",    period: "Feb 2026" },
    { id: "INV-2026-01-001", date: "Jan 1, 2026",  amount: 49, status: "paid",    period: "Jan 2026" },
    { id: "INV-2025-12-001", date: "Dec 1, 2025",  amount: 19, status: "paid",    period: "Dec 2025" },
  ];

  return (
    <div className="lp-page">
      <PageHeader title="Subscription & billing" sub="Manage your plan, payment method and invoices"/>

      {/* Free trial banner */}
      <div className="lp-callout" style={{ background: "var(--lp-violet-soft)", borderColor: "var(--lp-violet-soft)" }}>
        <window.Icon name="zap" size={16} style={{ color: "var(--lp-violet)" }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5 }}><b>Pro trial — 9 days left.</b> Trial ends May 29, 2026 · you won't be charged until then.</div>
          <div className="lp-muted" style={{ fontSize: 12 }}>Cancel anytime from this page · your data is kept for 60 days after cancellation.</div>
        </div>
        <window.Btn variant="ghost" size="sm">Cancel trial</window.Btn>
        <window.Btn variant="primary" size="sm">Keep Pro · $49/mo</window.Btn>
      </div>

      {/* Current plan summary */}
      <window.Card>
        <div className="lp-flex" style={{ gap: 20, alignItems: "flex-start" }}>
          <div className="lp-plan-icon"><window.Icon name="rocket" size={20}/></div>
          <div style={{ flex: 1 }}>
            <div className="lp-flex lp-flex-between" style={{ alignItems: "flex-start" }}>
              <div>
                <div className="lp-eyebrow">Current plan</div>
                <h2 className="lp-h2" style={{ margin: "4px 0 6px" }}>Pro · $49/month</h2>
                <div className="lp-muted">Renews <b>June 1, 2026</b> · 2,500 reviews/mo · 5 locations</div>
              </div>
              <window.Badge tone="success" dot>Active</window.Badge>
            </div>
            <div className="lp-grid lp-grid-3" style={{ marginTop: 18, gap: 14 }}>
              <UsageMeter label="Reviews used"   value={1284} max={2500} icon="sparkles" tone="primary"/>
              <UsageMeter label="Active campaigns" value={4}    max={10}   icon="qr"       tone="violet"/>
              <UsageMeter label="Team members"  value={3}    max={5}    icon="team"     tone="cyan"/>
            </div>
          </div>
        </div>
      </window.Card>

      {/* Plans */}
      <window.Card>
        <window.CardHeader
          title="Upgrade or change plan"
          subtitle="14-day free trial on any upgrade"
          action={
            <window.Segmented value={billing} onChange={setBilling} options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly · save 20%" },
            ]}/>
          }
        />
        <div className="lp-grid lp-grid-3" style={{ gap: 14, marginTop: 8 }}>
          {plans.map(p => (
            <div key={p.v} className={`lp-plan ${p.current ? "lp-plan-primary is-on" : ""}`} style={{ cursor: "default" }}>
              {p.badge && <span className="lp-plan-badge">{p.badge}</span>}
              <div className="lp-plan-name">{p.name}</div>
              <div className="lp-plan-sub">{p.sub}</div>
              <div className="lp-plan-price">
                <span className="lp-plan-amt">${p.price[billing]}</span>
                <span className="lp-plan-per">/ {billing === "monthly" ? "month" : "month, billed yearly"}</span>
              </div>
              <div className="lp-plan-quota">{p.quota}</div>
              <ul className="lp-plan-feats">
                {p.features.map(f => <li key={f}><window.Icon name="check" size={13}/>{f}</li>)}
              </ul>
              {p.current
                ? <window.Btn variant="secondary" className="lp-block" disabled>Current plan</window.Btn>
                : <window.Btn variant={p.v === "scale" ? "primary" : "secondary"} className="lp-block">{p.v === "starter" ? "Downgrade" : "Upgrade"}</window.Btn>}
            </div>
          ))}
        </div>
      </window.Card>

      {/* Payment + Billing */}
      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
        <window.Card>
          <window.CardHeader title="Payment method" action={<window.Btn variant="ghost" size="sm" icon="edit">Change</window.Btn>}/>
          <div className="lp-pay-card">
            <div className="lp-pay-card-brand">VISA</div>
            <div>
              <div style={{ fontWeight: 600 }}>•••• •••• •••• 4242</div>
              <div className="lp-muted">Expires 09/27 · Maya Okafor</div>
            </div>
            <window.Badge tone="success" dot>Default</window.Badge>
          </div>
          <div className="lp-grid lp-grid-2" style={{ marginTop: 14 }}>
            <window.Field label="Billing email"><window.Input defaultValue="maya@oliveandpine.co" icon="mail"/></window.Field>
            <window.Field label="Tax ID"><window.Input defaultValue="US 87-1234567"/></window.Field>
          </div>
        </window.Card>

        <window.Card>
          <window.CardHeader title="Spend over time" subtitle="Last 6 months"/>
          <window.Chart
            data={["Dec","Jan","Feb","Mar","Apr","May"].map((x, i) => ({ x, amount: [19, 49, 49, 49, 49, 49][i] }))}
            keys={["amount"]} colors={["primary"]} kind="bar" height={170} yTicks={3}
            formatY={(v) => `$${v}`}
          />
          <div className="lp-flex lp-flex-between" style={{ marginTop: 8, fontSize: 12.5 }}>
            <span className="lp-muted">Total this year</span>
            <span><b>$245.00</b></span>
          </div>
        </window.Card>
      </div>

      {/* Invoices */}
      <window.Card padded={false}>
        <div style={{ padding: "18px 22px 0" }}>
          <window.CardHeader title="Invoices" subtitle="Download for accounting" action={<window.Btn variant="ghost" size="sm" icon="download">Export all</window.Btn>}/>
        </div>
        <table className="lp-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Period</th>
              <th className="lp-num">Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><b>{inv.id}</b></td>
                <td>{inv.date}</td>
                <td className="lp-muted">{inv.period}</td>
                <td className="lp-num"><b>${inv.amount.toFixed(2)}</b></td>
                <td><window.Badge tone="success" dot>{inv.status}</window.Badge></td>
                <td>
                  <window.Btn variant="ghost" size="sm" icon="download"/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>
    </div>
  );
}

function UsageMeter({ label, value, max, icon, tone }) {
  const pctv = (value / max) * 100;
  return (
    <div className="lp-usage-meter">
      <div className="lp-flex lp-flex-between" style={{ marginBottom: 8, fontSize: 12.5 }}>
        <span className="lp-flex" style={{ gap: 6, color: "var(--lp-fg-muted)" }}>
          <window.Icon name={icon} size={13}/> {label}
        </span>
        <span><b>{window.fmt(value)}</b> <span className="lp-muted">/ {window.fmt(max)}</span></span>
      </div>
      <window.Progress value={value} max={max} tone={tone}/>
      <div className="lp-muted" style={{ fontSize: 11, marginTop: 4 }}>{pctv.toFixed(0)}% of monthly quota</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* USAGE TRACKING                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenUsage({ ctx }) {
  const days = window.dayLabels(30);
  const usage = window.genSeries(30, 42, 0.4, 0.5);
  const cumulative = [];
  usage.reduce((a, v, i) => { cumulative.push(a + v); return a + v; }, 0);

  return (
    <div className="lp-page">
      <PageHeader
        title="Usage"
        sub="Track quota consumption across reviews, scans and AI calls"
        actions={
          <window.Select value="current" onChange={() => {}} options={[
            { value: "current", label: "May 2026 (current)" },
            { value: "prev", label: "April 2026" },
            { value: "ytd", label: "Year to date" },
          ]}/>
        }
      />

      <div className="lp-grid lp-grid-4">
        <window.Card>
          <div className="lp-flex" style={{ justifyContent: "center", padding: "8px 0" }}>
            <window.Ring value={51.4} max={100} size={130} stroke={11} tone="primary"
                         label={<span><window.Counter value={51.4} decimals={1} suffix="%"/></span>}
                         sub="Pro quota"/>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="lp-muted">Reviews this cycle</div>
            <div><b>1,284</b> / 2,500</div>
          </div>
        </window.Card>
        <window.Stat label="Days remaining"  icon="history"  value={12}    suffix=" days" tone="violet"/>
        <window.Stat label="Projected total" icon="trendUp" value={2680}  delta={7.2}   tone="warning"/>
        <window.Stat label="Avg / day"       icon="bars"   value={61}    delta={4.2}   tone="cyan"/>
      </div>

      {/* Daily usage */}
      <window.Card>
        <window.CardHeader
          title="Daily AI review generations"
          subtitle="Each customer review counts toward your monthly quota"
          action={<window.Badge tone="warning" icon="zap">On track</window.Badge>}
        />
        <window.Chart
          data={days.map((x, i) => ({ x, used: usage[i], projected: i > 18 ? null : null }))}
          keys={["used"]} colors={["primary"]} kind="bar" height={240}
        />
      </window.Card>

      {/* Breakdown */}
      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 16 }}>
        <window.Card>
          <window.CardHeader title="By feature" subtitle="Where your quota is going"/>
          <div className="lp-stack" style={{ gap: 14, marginTop: 10 }}>
            {[
              { label: "AI review suggestions", used: 1284, max: 2500, tone: "primary", icon: "sparkles" },
              { label: "Refresh requests",      used: 487,  max: 1000, tone: "violet",  icon: "refresh" },
              { label: "Translation calls",     used: 142,  max: 500,  tone: "cyan",    icon: "globe" },
              { label: "Funnel page views",     used: 3420, max: 10000,tone: "success", icon: "eye" },
              { label: "QR scans tracked",      used: 3050, max: 10000,tone: "warning", icon: "qr" },
            ].map(f => {
              const pct = (f.used / f.max) * 100;
              return (
                <div key={f.label}>
                  <div className="lp-flex lp-flex-between" style={{ marginBottom: 6, fontSize: 12.5 }}>
                    <span className="lp-flex" style={{ gap: 6 }}>
                      <window.Icon name={f.icon} size={13} style={{ color: `var(--lp-${f.tone})` }}/>
                      <span style={{ color: "var(--lp-fg-muted)" }}>{f.label}</span>
                    </span>
                    <span><b>{window.fmt(f.used)}</b> <span className="lp-muted">/ {window.fmt(f.max)} · {pct.toFixed(0)}%</span></span>
                  </div>
                  <window.Progress value={f.used} max={f.max} tone={f.tone}/>
                </div>
              );
            })}
          </div>
        </window.Card>

        <window.Card>
          <window.CardHeader title="By campaign" subtitle="Quota consumption per QR campaign"/>
          <div className="lp-stack" style={{ gap: 12, marginTop: 10 }}>
            {[
              { name: "Front Counter", used: 542, tone: "primary" },
              { name: "Table Tents",   used: 388, tone: "violet" },
              { name: "Receipts",      used: 241, tone: "cyan" },
              { name: "Loyalty Email", used: 88,  tone: "warning" },
              { name: "Patio Event",   used: 25,  tone: "success" },
            ].map(c => (
              <div key={c.name} className="lp-flex" style={{ alignItems: "center", gap: 10 }}>
                <span style={{ width: 130, fontSize: 13 }}>{c.name}</span>
                <div style={{ flex: 1 }}><window.Progress value={c.used} max={600} tone={c.tone} height={8}/></div>
                <span style={{ width: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}><b>{c.used}</b></span>
              </div>
            ))}
          </div>
        </window.Card>
      </div>

      {/* Alerts */}
      <window.Card>
        <window.CardHeader title="Quota alerts" action={<window.Btn variant="ghost" size="sm" icon="plus">Add alert</window.Btn>}/>
        <div className="lp-stack" style={{ gap: 10 }}>
          {[
            { threshold: "75%", channel: "Email", state: true },
            { threshold: "90%", channel: "Email + SMS", state: true },
            { threshold: "100%", channel: "All channels + auto-upgrade", state: false },
          ].map((a, i) => (
            <div className="lp-alert-row" key={i}>
              <div className="lp-flex" style={{ gap: 12, alignItems: "center" }}>
                <span className="lp-alert-icon"><window.Icon name="bell" size={14}/></span>
                <div>
                  <div><b>Notify at {a.threshold}</b> of monthly quota</div>
                  <div className="lp-muted" style={{ fontSize: 12 }}>{a.channel}</div>
                </div>
              </div>
              <window.Switch checked={a.state} onChange={() => {}}/>
            </div>
          ))}
        </div>
      </window.Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* NOTIFICATIONS CENTER                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenNotifications({ ctx }) {
  const [tab, setTab] = useStateC("all");
  const [items, setItems] = useStateC([
    { id: 1, icon: "star", tone: "success", title: "New 5★ review submitted", body: "Customer #4821 just submitted a 5-star review for NW Portland.", time: "2 min ago", unread: true, cat: "reviews" },
    { id: 2, icon: "trendUp", tone: "primary", title: "Funnel A is outperforming", body: "Front Counter funnel up 12% week-over-week.", time: "1 hr ago", unread: true, cat: "system" },
    { id: 3, icon: "qr", tone: "violet", title: "New QR campaign published", body: "Patio Event campaign is live and accepting scans.", time: "3 hr ago", unread: true, cat: "system" },
    { id: 4, icon: "package", tone: "cyan", title: "Your printed materials shipped", body: "50× table tents shipped via UPS · arrives Wed May 22.", time: "Yesterday", unread: false, cat: "system" },
    { id: 5, icon: "flag", tone: "warning", title: "Low rating captured privately", body: "A 2★ rating was held back from Google and sent to your inbox.", time: "Yesterday", unread: false, cat: "alerts" },
    { id: 6, icon: "bell", tone: "warning", title: "You're at 75% of quota", body: "1,875 / 2,500 reviews used this month.", time: "2 days ago", unread: false, cat: "alerts" },
    { id: 7, icon: "card", tone: "neutral", title: "Invoice paid", body: "INV-2026-05-001 · $49.00", time: "May 1", unread: false, cat: "billing" },
    { id: 8, icon: "team", tone: "primary", title: "Jordan joined your team", body: "Accepted invite to manage QR campaigns.", time: "Apr 28", unread: false, cat: "system" },
    { id: 9, icon: "star", tone: "success", title: "10 new reviews this week", body: "Olive & Pine reached a 4.6★ average across 1,896 reviews.", time: "Apr 26", unread: false, cat: "reviews" },
  ]);

  const filtered = tab === "all" ? items : tab === "unread" ? items.filter(i => i.unread) : items.filter(i => i.cat === tab);
  const unreadCount = items.filter(i => i.unread).length;
  const markRead = (id) => setItems(items.map(i => i.id === id ? { ...i, unread: false } : i));
  const markAllRead = () => setItems(items.map(i => ({ ...i, unread: false })));

  return (
    <div className="lp-page">
      <PageHeader
        title="Notifications"
        sub={`${unreadCount} unread · all your funnel activity in one place`}
        actions={
          <>
            <window.Btn icon="check" onClick={markAllRead}>Mark all read</window.Btn>
            <window.Btn icon="cog">Preferences</window.Btn>
          </>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: "minmax(0,1fr) 320px", gap: 16, alignItems: "start" }}>
        <window.Card padded={false}>
          <div style={{ padding: "16px 20px 0" }}>
            <window.Tabs value={tab} onChange={setTab} tabs={[
              { value: "all", label: `All · ${items.length}` },
              { value: "unread", label: `Unread · ${unreadCount}` },
              { value: "reviews", label: "Reviews" },
              { value: "alerts", label: "Alerts" },
              { value: "billing", label: "Billing" },
              { value: "system", label: "System" },
            ]}/>
          </div>
          <div className="lp-notif-list">
            {filtered.length === 0
              ? <window.Empty icon="bell" title="All caught up" sub="You'll see new notifications here when activity happens."/>
              : filtered.map(n => (
                <button key={n.id} className={`lp-notif ${n.unread ? "is-unread" : ""}`} onClick={() => markRead(n.id)}>
                  <span className={`lp-notif-icon lp-tone-${n.tone}`}><window.Icon name={n.icon} size={14}/></span>
                  <div className="lp-notif-body">
                    <div className="lp-notif-title">{n.title}</div>
                    <div className="lp-notif-text">{n.body}</div>
                    <div className="lp-notif-time">{n.time}</div>
                  </div>
                  {n.unread && <span className="lp-notif-dot"/>}
                </button>
              ))}
          </div>
        </window.Card>

        {/* Right: preferences */}
        <window.Card>
          <window.CardHeader title="Delivery preferences"/>
          <div className="lp-stack" style={{ gap: 12 }}>
            <NotifPref title="New 5★ reviews" sub="Push + email" defaultOn/>
            <NotifPref title="Low ratings captured" sub="Email only" defaultOn/>
            <NotifPref title="Quota alerts" sub="Email + SMS" defaultOn/>
            <NotifPref title="Funnel performance" sub="Weekly digest"/>
            <NotifPref title="Team activity" sub="Push"/>
            <NotifPref title="Billing & invoices" sub="Email" defaultOn/>
            <NotifPref title="Product updates" sub="Email"/>
          </div>
          <div className="lp-divider"/>
          <div className="lp-stack" style={{ gap: 8 }}>
            <div className="lp-eyebrow">Channels</div>
            <div className="lp-flex lp-flex-between"><span><window.Icon name="mail" size={14}/> Email</span><span className="lp-muted">maya@oliveandpine.co</span></div>
            <div className="lp-flex lp-flex-between"><span><window.Icon name="smartphone" size={14}/> SMS</span><span className="lp-muted">+1 (503) ••• 0182</span></div>
            <div className="lp-flex lp-flex-between"><span><window.Icon name="bell" size={14}/> Push</span><window.Badge tone="success" dot>On</window.Badge></div>
          </div>
        </window.Card>
      </div>
    </div>
  );
}

function NotifPref({ title, sub, defaultOn = false }) {
  const [on, setOn] = useStateC(defaultOn);
  return (
    <div className="lp-flex lp-flex-between" style={{ alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 13 }}>{title}</div>
        <div className="lp-muted" style={{ fontSize: 11 }}>{sub}</div>
      </div>
      <window.Switch checked={on} onChange={setOn}/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* SETTINGS                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScreenSettings({ ctx }) {
  const [section, setSection] = useStateC("profile");

  const sections = [
    { v: "profile",     label: "Business profile",  icon: "building" },
    { v: "brand",       label: "Branding",          icon: "sparkles" },
    { v: "funnel",      label: "Funnel defaults",   icon: "funnel" },
    { v: "notifs",      label: "Notifications",     icon: "bell" },
    { v: "team",        label: "Team access",       icon: "team" },
    { v: "security",    label: "Security",          icon: "shield" },
    { v: "api",         label: "API & webhooks",    icon: "key" },
    { v: "billing",     label: "Billing preferences", icon: "card" },
  ];

  return (
    <div className="lp-page">
      <PageHeader
        title="Settings"
        sub="Account, business and dashboard preferences"
        actions={<window.Btn variant="primary" icon="check">Save changes</window.Btn>}
      />

      <div className="lp-grid" style={{ gridTemplateColumns: "220px minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <window.Card padded={false} className="lp-sett-nav">
          {sections.map(s => (
            <button key={s.v} onClick={() => setSection(s.v)} className={`lp-sett-nav-item ${section === s.v ? "is-on" : ""}`}>
              <window.Icon name={s.icon} size={15}/>
              <span>{s.label}</span>
            </button>
          ))}
        </window.Card>

        <div className="lp-stack">
          {section === "profile" && <SettProfile ctx={ctx}/>}
          {section === "brand" && <SettBrand ctx={ctx}/>}
          {section === "funnel" && <SettFunnel/>}
          {section === "notifs" && <SettNotifs/>}
          {section === "team" && <SettTeam/>}
          {section === "security" && <SettSecurity/>}
          {section === "api" && <SettApi/>}
          {section === "billing" && <SettBilling/>}
        </div>
      </div>
    </div>
  );
}

function SettProfile({ ctx }) {
  return (
    <>
      <window.Card>
        <window.CardHeader title="Business profile" subtitle="Public details about your business"/>
        <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
          <window.Field label="Business name"><window.Input defaultValue={ctx.biz.name}/></window.Field>
          <window.Field label="Industry"><window.Select value={ctx.biz.industry} options={["Restaurant","Salon","Clinic","Retail","Service"]} onChange={() => {}}/></window.Field>
          <window.Field label="Public email"><window.Input defaultValue="hello@oliveandpine.co" icon="mail"/></window.Field>
          <window.Field label="Phone"><window.Input defaultValue="(503) 555-0182"/></window.Field>
          <window.Field label="Website"><window.Input defaultValue="oliveandpine.co" prefix="https://"/></window.Field>
          <window.Field label="Timezone"><window.Select value="pst" options={[{value:"pst",label:"Pacific Time (PT)"},{value:"est",label:"Eastern Time (ET)"}]} onChange={() => {}}/></window.Field>
        </div>
      </window.Card>
      <window.Card>
        <window.CardHeader title="Owner account"/>
        <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
          <window.Field label="Full name"><window.Input defaultValue={ctx.biz.owner}/></window.Field>
          <window.Field label="Email"><window.Input defaultValue="maya@oliveandpine.co"/></window.Field>
        </div>
      </window.Card>
    </>
  );
}

function SettBrand({ ctx }) {
  return (
    <window.Card>
      <window.CardHeader title="Branding" subtitle="How your business appears on customer review funnels"/>
      <window.Field label="Logo">
        <div className="lp-upload">
          <div className="lp-upload-logo" style={{ background: ctx.biz.color }}>O&P</div>
          <div style={{ flex: 1 }}>
            <div className="lp-upload-title">olive-pine-logo.svg</div>
            <div className="lp-upload-sub">512×512 · uploaded May 1, 2026</div>
          </div>
          <window.Btn variant="ghost" size="sm" icon="upload">Replace</window.Btn>
        </div>
      </window.Field>
      <window.Field label="Brand colors">
        <div className="lp-color-row">
          {["#6366F1","#8B5CF6","#06B6D4","#10B981","#F59E0B","#EF4444","#0F172A"].map(c => (
            <button key={c} className={`lp-color-sw ${ctx.biz.color === c ? "is-on" : ""}`} style={{ background: c }}/>
          ))}
        </div>
      </window.Field>
      <window.Field label="Tagline">
        <window.Input defaultValue="Wood-fired comfort food, Portland's NW neighborhood since 2019."/>
      </window.Field>
      <window.Field label="Custom domain" hint="Use your own domain instead of loopr.io/r/...">
        <window.Input defaultValue="reviews.oliveandpine.co"/>
      </window.Field>
    </window.Card>
  );
}

function SettFunnel() {
  return (
    <window.Card>
      <window.CardHeader title="Funnel defaults" subtitle="Applied to all new funnels"/>
      <window.Field label="Default tone">
        <window.Select value="warm" options={["warm","professional","casual","enthusiastic"]} onChange={() => {}}/>
      </window.Field>
      <window.Field label="Default language">
        <window.Select value="english" options={["english","spanish","french","german"]} onChange={() => {}}/>
      </window.Field>
      <window.Field label="Star threshold for Google redirect">
        <window.StarRating value={4} readonly/>
      </window.Field>
      <window.Switch label="Disclose AI assistance" sub="Show 'AI-assisted' label on funnel" checked={true} onChange={() => {}}/>
      <window.Switch label="Throttle repeat scans" sub="One review per device per 30 days" checked={true} onChange={() => {}}/>
      <window.Switch label="Capture low ratings privately" sub="Don't redirect <4★ ratings to Google" checked={true} onChange={() => {}}/>
    </window.Card>
  );
}

function SettNotifs() {
  return (
    <window.Card>
      <window.CardHeader title="Notification preferences"/>
      <div className="lp-stack" style={{ gap: 12 }}>
        <NotifPref title="New 5★ reviews" sub="Push + email" defaultOn/>
        <NotifPref title="Low ratings captured" sub="Email only" defaultOn/>
        <NotifPref title="Quota alerts" sub="Email + SMS" defaultOn/>
        <NotifPref title="Funnel performance digest" sub="Weekly summary"/>
        <NotifPref title="Team activity" sub="Push"/>
        <NotifPref title="Billing & invoices" sub="Email" defaultOn/>
        <NotifPref title="Product updates" sub="Email"/>
      </div>
    </window.Card>
  );
}

function SettTeam() {
  const team = [
    { name: "Maya Okafor", email: "maya@oliveandpine.co", role: "Owner", status: "active" },
    { name: "Jordan Chen", email: "jordan@oliveandpine.co", role: "Admin", status: "active" },
    { name: "Sam Rivers", email: "sam@oliveandpine.co", role: "Editor", status: "active" },
    { name: "Tess Patel", email: "tess@oliveandpine.co", role: "Viewer", status: "pending" },
  ];
  return (
    <>
      <window.Card>
        <window.CardHeader title="Team members" subtitle="3 of 5 seats used" action={<window.Btn variant="primary" icon="plus" size="sm">Invite member</window.Btn>}/>
        <table className="lp-table lp-table-tight">
          <thead><tr><th>Member</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {team.map(m => (
              <tr key={m.email}>
                <td>
                  <div className="lp-tcell-main">
                    <window.Avatar name={m.name} size={28}/>
                    <div>
                      <div className="lp-tcell-name">{m.name}</div>
                      <div className="lp-tcell-sub">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <window.Select value={m.role} options={["Owner","Admin","Editor","Viewer"]} onChange={() => {}}/>
                </td>
                <td><window.Badge tone={m.status === "active" ? "success" : "warning"} dot>{m.status}</window.Badge></td>
                <td><window.Btn variant="ghost" size="sm" icon="more"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>
      <window.Card>
        <window.CardHeader title="Role permissions"/>
        <div className="lp-perm-grid">
          <div className="lp-perm-row lp-perm-head">
            <span>Permission</span><span>Owner</span><span>Admin</span><span>Editor</span><span>Viewer</span>
          </div>
          {[
            ["Edit funnel", true, true, true, false],
            ["Create QR campaigns", true, true, true, false],
            ["View analytics", true, true, true, true],
            ["Manage billing", true, false, false, false],
            ["Invite teammates", true, true, false, false],
          ].map(([label, ...perms]) => (
            <div className="lp-perm-row" key={label}>
              <span>{label}</span>
              {perms.map((p, i) => <span key={i}>{p ? <window.Icon name="check" size={14} style={{ color: "var(--lp-success)" }}/> : <window.Icon name="x" size={14} style={{ color: "var(--lp-fg-muted)" }}/>}</span>)}
            </div>
          ))}
        </div>
      </window.Card>
    </>
  );
}

function SettSecurity() {
  return (
    <>
      <window.Card>
        <window.CardHeader title="Password"/>
        <div className="lp-grid lp-grid-2" style={{ gap: 14 }}>
          <window.Field label="Current password"><window.Input type="password" defaultValue="••••••••" icon="lock"/></window.Field>
          <window.Field label="New password"><window.Input type="password" placeholder="At least 12 characters" icon="lock"/></window.Field>
        </div>
        <window.Btn variant="primary" icon="check">Update password</window.Btn>
      </window.Card>
      <window.Card>
        <window.CardHeader title="Two-factor authentication"/>
        <window.Switch label="Authenticator app" sub="Use Authy, 1Password or similar" checked={true} onChange={() => {}}/>
        <window.Switch label="SMS verification"  sub="As backup" checked={true} onChange={() => {}}/>
        <window.Switch label="Recovery codes"    sub="10 single-use codes" checked={false} onChange={() => {}}/>
      </window.Card>
      <window.Card>
        <window.CardHeader title="Active sessions" subtitle="Currently signed-in devices"/>
        {[
          { device: "MacBook Pro · Chrome", loc: "Portland, OR", last: "Active now", icon: "monitor", current: true },
          { device: "iPhone 15 · Loopr iOS", loc: "Portland, OR", last: "12 min ago", icon: "smartphone", current: false },
          { device: "iPad Air · Safari", loc: "Beaverton, OR", last: "Yesterday", icon: "tablet", current: false },
        ].map((s, i) => (
          <div className="lp-session" key={i}>
            <span className="lp-session-icon"><window.Icon name={s.icon} size={16}/></span>
            <div style={{ flex: 1 }}>
              <div><b>{s.device}</b> {s.current && <window.Badge tone="primary">This device</window.Badge>}</div>
              <div className="lp-muted" style={{ fontSize: 12 }}>{s.loc} · {s.last}</div>
            </div>
            {!s.current && <window.Btn variant="ghost" size="sm">Revoke</window.Btn>}
          </div>
        ))}
      </window.Card>
    </>
  );
}

function SettApi() {
  return (
    <>
      <window.Card>
        <window.CardHeader title="API keys" subtitle="Use to access your funnel data programmatically" action={<window.Btn variant="primary" icon="plus" size="sm">Generate key</window.Btn>}/>
        <table className="lp-table lp-table-tight">
          <thead><tr><th>Name</th><th>Key</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {[
              { name: "Production", key: "lpr_live_5a8c•••e92f", created: "Apr 1, 2026" },
              { name: "Reporting CSV", key: "lpr_live_3b21•••f7d0", created: "Mar 12, 2026" },
            ].map(k => (
              <tr key={k.name}>
                <td><b>{k.name}</b></td>
                <td><code>{k.key}</code></td>
                <td className="lp-muted">{k.created}</td>
                <td><window.Btn variant="ghost" size="sm" icon="copy"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </window.Card>
      <window.Card>
        <window.CardHeader title="Webhooks" action={<window.Btn variant="ghost" icon="plus" size="sm">Add webhook</window.Btn>}/>
        {[
          { url: "https://oliveandpine.co/webhooks/loopr", events: "review.submitted, redirect.completed" },
          { url: "https://hooks.zapier.com/...abc123", events: "scan.created" },
        ].map(w => (
          <div className="lp-webhook" key={w.url}>
            <span className="lp-webhook-icon"><window.Icon name="link" size={14}/></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lp-truncate"><b>{w.url}</b></div>
              <div className="lp-muted" style={{ fontSize: 12 }}>{w.events}</div>
            </div>
            <window.Badge tone="success" dot>Active</window.Badge>
          </div>
        ))}
      </window.Card>
    </>
  );
}

function SettBilling() {
  return (
    <window.Card>
      <window.CardHeader title="Billing preferences"/>
      <window.Field label="Billing email"><window.Input defaultValue="maya@oliveandpine.co" icon="mail"/></window.Field>
      <window.Field label="Receipt language"><window.Select value="english" options={["english","spanish","french"]} onChange={() => {}}/></window.Field>
      <window.Field label="Tax ID"><window.Input defaultValue="US 87-1234567"/></window.Field>
      <window.Switch label="Auto-upgrade plan when at 100% quota" sub="Avoid funnel disruption — billed pro-rated" checked={false} onChange={() => {}}/>
      <window.Switch label="Send monthly statement to accountant" sub="cc: accounting@oliveandpine.co" checked={true} onChange={() => {}}/>
    </window.Card>
  );
}

Object.assign(window, { ScreenBilling, ScreenUsage, ScreenNotifications, ScreenSettings });
