// app.jsx — main app. Wraps all screens in a DesignCanvas.

const { useState, useEffect } = React;

// Apply theme by setting data-theme on <html>
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "comfortable",
  "accent": "purple",
  "collapsed": false,
  "statCardStyle": "gradient"
}/*EDITMODE-END*/;

function App() {
  // useTweaks gives state + persists to disk via host bridge
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme + accent class to root
  useEffect(() => { applyTheme(t.theme); }, [t.theme]);

  // We pass shellProps so each screen can render its Shell with the right state
  const shellProps = {
    theme: t.theme,
    setTheme: (v) => setTweak('theme', v),
    collapsed: t.collapsed,
    setCollapsed: (v) => setTweak('collapsed', typeof v === 'function' ? v(t.collapsed) : v),
    onNavigate: () => {}, // each artboard is its own screen, no top-level routing
  };

  // Density + accent are applied via classes on the artboard wrapper
  const wrapClass = `rv-density-${t.density} rv-accent-${t.accent}`;

  return (
    <>
      <DesignCanvas>
        <DCSection id="auth" title="Auth & Errors" subtitle="Login + 404">
          <DCArtboard id="login"     label="01 · Admin Login"        width={1440} height={900}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}><LoginScreen/></div>
          </DCArtboard>
          <DCArtboard id="not-found" label="— · 404 Not Found"       width={1440} height={900}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}><NotFoundScreen/></div>
          </DCArtboard>
        </DCSection>

        <DCSection id="core" title="Core Console" subtitle="Dashboard, businesses & detail">
          <DCArtboard id="dashboard"   label="02 · Admin Dashboard"          width={1440} height={1020}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <DashboardScreen shellProps={shellProps} statCardStyle={t.statCardStyle}/>
            </div>
          </DCArtboard>
          <DCArtboard id="biz-list"    label="03 · Business Management"      width={1440} height={1100}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <BusinessesListScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="biz-detail"  label="04 · Business Details (5 tabs)" width={1440} height={1120}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <BusinessDetailScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="qr"          label="05 · QR Management"            width={1440} height={1120}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <QRManagementScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="billing" title="Billing & Revenue" subtitle="Subscriptions, invoices, MRR">
          <DCArtboard id="sub-list"   label="06 · Subscription Management" width={1440} height={1100}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <SubscriptionsListScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="sub-detail" label="06a · Subscription Detail"    width={1440} height={920}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <SubscriptionDetailScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="revenue"    label="07 · Revenue Dashboard"      width={1440} height={1100}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <RevenueDashboardScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="insight" title="AI, Analytics & Oversight" subtitle="Platform-wide visibility">
          <DCArtboard id="ai"         label="08 · AI Usage Dashboard"     width={1440} height={1200}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <AIUsageScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="analytics"  label="09 · Platform Analytics"     width={1440} height={1240}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <AnalyticsScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="abuse"      label="10 · Abuse Monitoring"       width={1440} height={1100}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <AbuseScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="audit"      label="11 · Audit Logs"             width={1440} height={1000}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <AuditLogsScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
          <DCArtboard id="settings"   label="12 · Platform Settings"      width={1440} height={1200}>
            <div className={wrapClass} style={{ width: '100%', height: '100%' }}>
              <SettingsScreen shellProps={shellProps}/>
            </div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Appearance"/>
        <TweakRadio  label="Theme"   value={t.theme}   onChange={v => setTweak('theme', v)}   options={[{label:'Light',value:'light'},{label:'Dark',value:'dark'}]}/>
        <TweakRadio  label="Density" value={t.density} onChange={v => setTweak('density', v)} options={[{label:'Comfy',value:'comfortable'},{label:'Compact',value:'compact'}]}/>
        <TweakRadio  label="Accent"  value={t.accent}  onChange={v => setTweak('accent', v)}  options={[{label:'Purple',value:'purple'},{label:'Blue',value:'blue'},{label:'Mono',value:'mono'}]}/>

        <TweakSection label="Layout"/>
        <TweakToggle label="Sidebar collapsed"     value={t.collapsed}     onChange={v => setTweak('collapsed', v)}/>
        <TweakSelect label="Dashboard stat cards"  value={t.statCardStyle} onChange={v => setTweak('statCardStyle', v)}
          options={[
            { label: 'Flat',     value: 'flat' },
            { label: 'Gradient (hero)', value: 'gradient' },
            { label: 'Outlined', value: 'outlined' },
          ]}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
