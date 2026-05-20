// app.jsx — App shell, sidebar nav, top bar, tweaks integration, screen router.

const { useState: useStateApp, useEffect: useEffectApp, useMemo: useMemoApp, useLayoutEffect: useLayoutEffectApp } = React;

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "dashboard",     label: "Dashboard",          icon: "home" },
      { id: "funnel",        label: "Funnel manager",     icon: "funnel" },
      { id: "qr",            label: "QR codes",           icon: "qr", badgeSoft: "5" },
      { id: "analytics",     label: "Analytics",          icon: "bars" },
    ],
  },
  {
    label: "Records",
    items: [
      { id: "history",       label: "Review history",     icon: "history", badgeSoft: "24" },
      { id: "usage",         label: "Usage",              icon: "gauge" },
      { id: "notifications", label: "Notifications",      icon: "bell",    badge: "3" },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "profile",       label: "Business profile",   icon: "building" },
      { id: "billing",       label: "Billing",            icon: "card" },
      { id: "settings",      label: "Settings",           icon: "cog" },
    ],
  },
  {
    label: "Setup",
    items: [
      { id: "onboarding",    label: "Onboarding tour",    icon: "rocket" },
      { id: "qr-request",    label: "Request QR",         icon: "plus" },
    ],
  },
];

const SCREEN_MAP = {
  dashboard:     "ScreenDashboard",
  funnel:        "ScreenFunnel",
  qr:            "ScreenQR",
  "qr-request":  "ScreenQRRequest",
  analytics:     "ScreenAnalytics",
  history:       "ScreenHistory",
  usage:         "ScreenUsage",
  notifications: "ScreenNotifications",
  profile:       "ScreenProfile",
  billing:       "ScreenBilling",
  settings:      "ScreenSettings",
  onboarding:    "ScreenOnboarding",
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#6366F1",
  "dark": false,
  "density": "regular",
  "chartStyle": "area",
  "persona": "restaurant",
  "funnelStyle": "elegant"
}/*EDITMODE-END*/;

const PERSONAS = {
  restaurant: { name: "Olive & Pine Bistro", initials: "O&P", industry: "Restaurant", owner: "Maya Okafor" },
  salon:      { name: "Lumen Hair Studio",   initials: "LM",  industry: "Salon",      owner: "Priya Sharma" },
  clinic:     { name: "Brightwell Dental",   initials: "BW",  industry: "Clinic",     owner: "Dr. Adam Hale" },
  retail:     { name: "Northbound Goods",    initials: "NG",  industry: "Retail",     owner: "Jamie Lin" },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const params = new URLSearchParams(window.location.search);
  const soloScreen = params.get("solo");

  const [screen, setScreen] = useStateApp(() => {
    if (soloScreen && SCREEN_MAP[soloScreen]) return soloScreen;
    const h = window.location.hash.slice(1);
    return SCREEN_MAP[h] ? h : "dashboard";
  });

  // Sync hash <-> state
  useEffectApp(() => {
    window.location.hash = screen;
    const onHash = () => {
      const h = window.location.hash.slice(1);
      if (SCREEN_MAP[h]) setScreen(h);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [screen]);

  // Apply theme + density + accent to <html>
  useLayoutEffectApp(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-density", t.density || "regular");
    if (t.accent) {
      root.style.setProperty("--lp-primary", t.accent);
      root.style.setProperty("--lp-primary-hover", shade(t.accent, -10));
      root.style.setProperty("--lp-primary-soft", soft(t.accent, t.dark));
    } else {
      root.style.removeProperty("--lp-primary");
    }
  }, [t.dark, t.density, t.accent]);

  const persona = PERSONAS[t.persona] || PERSONAS.restaurant;
  const biz = {
    ...persona,
    color: t.accent,
    industry: persona.industry,
  };

  const nav = (id) => setScreen(id);
  const ctx = { biz, nav, t, setTweak, screen };

  const ScreenComp = window[SCREEN_MAP[screen]] || (() => <window.Empty title="Screen not found"/>);

  if (soloScreen) {
    return (
      <div className="lp-app lp-app-solo">
        <main className="lp-main">
          <ScreenComp ctx={ctx}/>
        </main>
      </div>
    );
  }

  return (
    <div className="lp-app">
      <Sidebar screen={screen} nav={nav} biz={biz}/>
      <main className="lp-main">
        <Topbar screen={screen} nav={nav}/>
        <ScreenComp ctx={ctx}/>
        <LooprTweaks t={t} setTweak={setTweak}/>
      </main>
    </div>
  );
}

function shade(hex, percent) {
  const n = parseInt(hex.replace("#",""), 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  const p = percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r + (p < 0 ? r * p : (255 - r) * p))));
  g = Math.max(0, Math.min(255, Math.round(g + (p < 0 ? g * p : (255 - g) * p))));
  b = Math.max(0, Math.min(255, Math.round(b + (p < 0 ? b * p : (255 - b) * p))));
  return "#" + [r,g,b].map(c => c.toString(16).padStart(2,"0")).join("");
}

function soft(hex, dark) {
  const n = parseInt(hex.replace("#",""), 16);
  const r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  if (dark) {
    return `rgb(${Math.round(r*0.18)}, ${Math.round(g*0.18)}, ${Math.round(b*0.22)})`;
  }
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

function Sidebar({ screen, nav, biz }) {
  return (
    <aside className="lp-sidebar">
      <div className="lp-brand">
        <div className="lp-brand-mark">L</div>
        <div className="lp-brand-name"><b>Loopr</b></div>
      </div>

      <div className="lp-biz-select">
        <div className="lp-biz-logo" style={{ background: biz.color }}>{biz.initials}</div>
        <div className="lp-biz-info">
          <div className="lp-biz-name lp-truncate">{biz.name}</div>
          <div className="lp-biz-sub">Pro plan</div>
        </div>
        <window.Icon name="chevronD" size={14} className="lp-muted"/>
      </div>

      <nav className="lp-sidebar-nav">
        {NAV_GROUPS.map(g => (
          <React.Fragment key={g.label}>
            <div className="lp-nav-group">{g.label}</div>
            {g.items.map(i => (
              <button key={i.id} onClick={() => nav(i.id)} className={`lp-nav-item ${screen === i.id ? "is-on" : ""}`}>
                <window.Icon name={i.icon} size={16}/>
                <span>{i.label}</span>
                {i.badge && <span className="lp-nav-badge">{i.badge}</span>}
                {i.badgeSoft && <span className="lp-nav-badge-soft">{i.badgeSoft}</span>}
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="lp-sidebar-foot">
        <window.Avatar name={biz.owner} size={32}/>
        <div className="lp-foot-info">
          <div className="lp-foot-name lp-truncate">{biz.owner}</div>
          <div className="lp-foot-sub lp-truncate">{biz.name.split(" ").slice(-2).join(" ").toLowerCase()}@loopr</div>
        </div>
        <window.Btn variant="ghost" icon="more" size="sm"/>
      </div>
    </aside>
  );
}

function Topbar({ screen, nav }) {
  return (
    <div className="lp-topbar">
      <div className="lp-topbar-search">
        <window.Input icon="search" placeholder="Search campaigns, reviews, customers…"/>
      </div>
      <div className="lp-topbar-actions">
        <button className="lp-topbar-btn" onClick={() => nav("qr-request")} title="New QR campaign">
          <window.Icon name="plus" size={16}/>
        </button>
        <button className="lp-topbar-btn" onClick={() => nav("notifications")} title="Notifications">
          <window.Icon name="bell" size={16}/>
          <span className="lp-topbar-dot"/>
        </button>
        <button className="lp-topbar-btn" onClick={() => nav("settings")} title="Settings">
          <window.Icon name="cog" size={16}/>
        </button>
        <div style={{ width: 1, height: 22, background: "var(--lp-border)", margin: "0 4px" }}/>
        <window.Avatar name="Maya O" size={30}/>
      </div>
    </div>
  );
}

function LooprTweaks({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Theme"/>
      <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)}/>
      <TweakColor label="Accent"
        value={t.accent}
        options={["#6366F1", "#0EA5E9", "#10B981", "#F97316", "#8B5CF6", "#0F172A"]}
        onChange={(v) => setTweak("accent", v)}/>

      <TweakSection label="Layout"/>
      <TweakRadio label="Density" value={t.density}
        options={["compact", "regular", "comfortable"]}
        onChange={(v) => setTweak("density", v)}/>

      <TweakSection label="Charts"/>
      <TweakRadio label="Chart style" value={t.chartStyle}
        options={["area", "line", "bar"]}
        onChange={(v) => setTweak("chartStyle", v)}/>

      <TweakSection label="Business persona"/>
      <TweakSelect label="Sample business" value={t.persona}
        options={[
          { value: "restaurant", label: "Olive & Pine — restaurant" },
          { value: "salon",      label: "Lumen Hair — salon" },
          { value: "clinic",     label: "Brightwell — dental" },
          { value: "retail",     label: "Northbound Goods — retail" },
        ]}
        onChange={(v) => setTweak("persona", v)}/>

      <TweakSection label="Funnel style"/>
      <TweakRadio label="Customer view" value={t.funnelStyle}
        options={["elegant", "vivid", "minimal", "playful"]}
        onChange={(v) => setTweak("funnelStyle", v)}/>
    </TweaksPanel>
  );
}

window.LooprApp = App;
