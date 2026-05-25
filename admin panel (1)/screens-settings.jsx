// screens-settings.jsx — Platform Settings with tabbed config

const SettingsScreen = ({ shellProps }) => {
  const [tab, setTab] = React.useState('ai');

  return (
    <Shell
      {...shellProps}
      active="settings"
      breadcrumbs={['Admin', 'Settings']}
      pageTitle="Platform Settings"
      pageActions={
        <>
          <Button variant="ghost" icon={<Ico.X size={14}/>}>Discard</Button>
          <Button variant="primary" icon={<Ico.Check size={14}/>}>Save changes</Button>
        </>
      }>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Settings nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          {[
            { id: 'ai',       label: 'AI configuration', icon: <Ico.AI/> },
            { id: 'payments', label: 'Payments',         icon: <Ico.Revenue/> },
            { id: 'branding', label: 'Branding',         icon: <Ico.Sparkles/> },
            { id: 'email',    label: 'Email',            icon: <Ico.Mail/> },
            { id: 'security', label: 'Security',         icon: <Ico.ShieldAlert/> },
            { id: 'limits',   label: 'Usage limits',     icon: <Ico.Filter/> },
            { id: 'api',      label: 'API keys',         icon: <Ico.Lock/> },
          ].map(n => {
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', textAlign: 'left',
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent-ink)' : 'var(--ink-2)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                cursor: 'pointer',
              }}>
                <span style={{ display: 'inline-flex', color: active ? 'var(--accent)' : 'var(--muted)' }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {tab === 'ai' && <AISettingsTab/>}
          {tab === 'payments' && <PaymentsSettingsTab/>}
          {tab === 'branding' && <BrandingSettingsTab/>}
          {tab === 'email' && <EmailSettingsTab/>}
          {tab === 'security' && <SecuritySettingsTab/>}
          {tab === 'limits' && <LimitsSettingsTab/>}
          {tab === 'api' && <APISettingsTab/>}
        </div>
      </div>
    </Shell>
  );
};

// =============================================================
// Settings primitives
// =============================================================
const SettingsCard = ({ title, subtitle, children, actions }) => (
  <Card padding={0}>
    <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.005em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3 }}>{subtitle}</div>}
        </div>
        {actions}
      </div>
    </div>
    <div style={{ padding: '4px 22px 18px' }}>
      {children}
    </div>
  </Card>
);

const SettingsRow = ({ label, hint, children, last }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24,
    padding: '14px 0', borderBottom: last ? 'none' : '1px solid var(--border)',
    alignItems: 'center',
  }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{hint}</div>}
    </div>
    <div>{children}</div>
  </div>
);

const Toggle = ({ on, onClick }) => (
  <span onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', padding: 2,
    width: 36, height: 20, borderRadius: 10,
    background: on ? 'var(--accent)' : 'var(--surface-2)',
    justifyContent: on ? 'flex-end' : 'flex-start',
    cursor: 'pointer', transition: 'background .15s',
  }}>
    <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
  </span>
);

const TextField = ({ value, mono, width = 320 }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 36, width, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
    <input defaultValue={value} style={{
      border: 0, outline: 0, flex: 1, fontSize: 13, background: 'transparent', color: 'var(--ink)',
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
    }}/>
  </div>
);

const Slider = ({ value, min = 0, max = 100, suffix }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 320 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--surface-2)', borderRadius: 2, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: 'var(--accent-gradient)', borderRadius: 2 }}/>
        <div style={{ position: 'absolute', left: `calc(${pct}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: '50%', background: '#fff', border: '2px solid var(--accent)', boxShadow: 'var(--shadow-sm)' }}/>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'right' }}>{value}{suffix}</span>
    </div>
  );
};

// =============================================================
// AI Settings
// =============================================================
const AISettingsTab = () => (
  <>
    <SettingsCard title="AI configuration"
      subtitle="Defaults applied to every review generation request across the platform">
      <SettingsRow label="Default model" hint="Primary model for AI review generation">
        <Select value="claude-haiku-4-5" onChange={() => {}}
          options={[
            { value: 'claude-haiku-4-5',  label: 'claude-haiku-4-5 (default)' },
            { value: 'claude-sonnet-4-5', label: 'claude-sonnet-4-5 (premium)' },
            { value: 'gpt-4o-mini',       label: 'gpt-4o-mini (fallback)' },
          ]}/>
      </SettingsRow>
      <SettingsRow label="Drafts per request" hint="Number of review variations shown to the user">
        <Slider value={2} min={1} max={5}/>
      </SettingsRow>
      <SettingsRow label="Temperature" hint="Higher = more creative, lower = more consistent">
        <Slider value={0.75} min={0} max={1}/>
      </SettingsRow>
      <SettingsRow label="Max tokens" hint="Per-request output ceiling">
        <TextField value="1024" mono width={140}/>
      </SettingsRow>
      <SettingsRow label="Timeout" hint="Hard cap on inference duration">
        <TextField value="12s" mono width={140}/>
      </SettingsRow>
      <SettingsRow label="Refresh limit per scan" hint="How many times a user can refresh a draft" last>
        <Slider value={4} min={1} max={10}/>
      </SettingsRow>
    </SettingsCard>

    <SettingsCard title="Content filter" subtitle="Block AI-generated reviews containing flagged language">
      <SettingsRow label="Filter strictness" hint="Strict blocks any flagged term · Balanced allows mild language">
        <Select value="strict" onChange={() => {}}
          options={[{ value: 'strict', label: 'Strict' }, { value: 'balanced', label: 'Balanced' }, { value: 'permissive', label: 'Permissive' }]}/>
      </SettingsRow>
      <SettingsRow label="Profanity check" hint="Reject reviews with profanity">
        <Toggle on={true}/>
      </SettingsRow>
      <SettingsRow label="Competitor mentions" hint="Strip references to competing businesses">
        <Toggle on={true}/>
      </SettingsRow>
      <SettingsRow label="PII detection" hint="Remove names, phone numbers, emails from reviews" last>
        <Toggle on={true}/>
      </SettingsRow>
    </SettingsCard>
  </>
);

// =============================================================
// Payments
// =============================================================
const PaymentsSettingsTab = () => (
  <>
    <SettingsCard title="Payment provider"
      subtitle="Configure the billing provider used for subscriptions and invoices"
      actions={<Button variant="secondary" size="sm" icon={<Ico.External size={12}/>}>Open Stripe</Button>}>
      <SettingsRow label="Active provider">
        <Select value="stripe" onChange={() => {}}
          options={[{ value: 'stripe', label: 'Stripe' }, { value: 'paddle', label: 'Paddle' }, { value: 'manual', label: 'Manual (admin only)' }]}/>
      </SettingsRow>
      <SettingsRow label="Webhook secret" hint="Used to verify incoming webhook requests">
        <TextField value="whsec_•••••••••••••H4n2a" mono width={360}/>
      </SettingsRow>
      <SettingsRow label="Currency" hint="Default currency for new subscriptions">
        <Select value="usd" onChange={() => {}}
          options={[{ value: 'usd', label: 'USD · US Dollar' }, { value: 'eur', label: 'EUR · Euro' }, { value: 'gbp', label: 'GBP · British Pound' }]}/>
      </SettingsRow>
      <SettingsRow label="Tax handling" hint="Stripe Tax automatically calculates and collects sales tax">
        <Toggle on={true}/>
      </SettingsRow>
      <SettingsRow label="Dunning attempts" hint="Number of retries before subscription is canceled" last>
        <Slider value={4} min={1} max={8}/>
      </SettingsRow>
    </SettingsCard>

    <SettingsCard title="Plan prices" subtitle="Monthly prices charged to businesses">
      {[
        { plan: 'free',       price: 0 },
        { plan: 'starter',    price: 19 },
        { plan: 'pro',        price: 49 },
        { plan: 'enterprise', price: 199 },
      ].map((p, i) => (
        <SettingsRow key={p.plan}
          label={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><PlanBadge plan={p.plan}/></span>}
          hint={`${PLAN_LIMITS[p.plan].reviews === null ? 'Unlimited' : PLAN_LIMITS[p.plan].reviews.toLocaleString()} reviews · ${PLAN_LIMITS[p.plan].scans === null ? 'unlimited' : PLAN_LIMITS[p.plan].scans.toLocaleString()} scans · ${PLAN_LIMITS[p.plan].campaigns === null ? 'unlimited' : PLAN_LIMITS[p.plan].campaigns} campaigns`}
          last={i === 3}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 0 0 12px', height: 36, width: 140, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>$</span>
              <input defaultValue={p.price} style={{ border: 0, outline: 0, flex: 1, fontSize: 13, fontWeight: 600, background: 'transparent', color: 'var(--ink)', padding: '0 8px', fontVariantNumeric: 'tabular-nums' }}/>
              <span style={{ color: 'var(--muted)', fontSize: 12, paddingRight: 12 }}>/mo</span>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>USD</span>
          </div>
        </SettingsRow>
      ))}
    </SettingsCard>
  </>
);

// =============================================================
// Branding
// =============================================================
const BrandingSettingsTab = () => (
  <SettingsCard title="Branding"
    subtitle="Default visual identity applied to public review pages and emails">
    <SettingsRow label="Platform name">
      <TextField value="Reevo" width={260}/>
    </SettingsRow>
    <SettingsRow label="Tagline" hint="Shown on the marketing site and footer">
      <TextField value="The AI review platform for local businesses" width={420}/>
    </SettingsRow>
    <SettingsRow label="Primary brand color" hint="Default brand color for businesses without one set">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 6, background: '#6E5BFF', border: '1px solid var(--border-strong)' }}/>
        <TextField value="#6E5BFF" mono width={140}/>
      </div>
    </SettingsRow>
    <SettingsRow label="Accent gradient" hint="Used on hero cards, active states, and CTAs">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg, #6E5BFF 0%, #2F7DFB 100%)', border: '1px solid var(--border-strong)' }}/>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>#6E5BFF → #2F7DFB</code>
        <Button variant="ghost" size="sm">Edit</Button>
      </div>
    </SettingsRow>
    <SettingsRow label="Default logo initials" hint="Two-character fallback when a business has no logo">
      <TextField value="BZ" mono width={100}/>
    </SettingsRow>
    <SettingsRow label="Review page footer" last>
      <TextField value="Powered by Reevo" width={260}/>
    </SettingsRow>
  </SettingsCard>
);

// =============================================================
// Email
// =============================================================
const EmailSettingsTab = () => (
  <>
    <SettingsCard title="Transactional email"
      subtitle="Configured via Resend · sender domain mail.reevo.io">
      <SettingsRow label="From address">
        <TextField value="hello@mail.reevo.io" mono width={300}/>
      </SettingsRow>
      <SettingsRow label="Reply-to">
        <TextField value="support@reevo.io" mono width={300}/>
      </SettingsRow>
      <SettingsRow label="Webhook signing secret" hint="Resend webhook verification">
        <TextField value="rs_••••••••••••••3kBg" mono width={300}/>
      </SettingsRow>
      <SettingsRow label="Domain status" last>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, borderRadius: 999, background: 'var(--success-soft)', color: 'var(--success-ink)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}/>
          Verified · SPF, DKIM, DMARC pass
        </span>
      </SettingsRow>
    </SettingsCard>

    <SettingsCard title="Notification templates" subtitle="Toggle which automated emails are sent to business owners">
      {[
        { name: 'Welcome email',           desc: 'Sent on signup',                                  on: true,  edit: true },
        { name: 'Plan upgraded',           desc: 'Sent when a business changes plan',               on: true,  edit: true },
        { name: 'Payment failed',          desc: 'Sent on each failed dunning attempt',             on: true,  edit: true },
        { name: 'Subscription canceling',  desc: 'Sent when cancel_at_end is set to true',          on: true,  edit: true },
        { name: 'Monthly scan summary',    desc: 'Weekly digest of QR scans and reviews',           on: false, edit: true },
        { name: 'Abuse warning',           desc: 'Sent when a QR code is auto-paused by admin',     on: true,  edit: true },
      ].map((t, i, arr) => (
        <SettingsRow key={i} label={t.name} hint={t.desc} last={i === arr.length - 1}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Toggle on={t.on}/>
            <Button variant="ghost" size="sm" iconRight={<Ico.ArrowRight size={12}/>}>Edit template</Button>
          </div>
        </SettingsRow>
      ))}
    </SettingsCard>
  </>
);

// =============================================================
// Security
// =============================================================
const SecuritySettingsTab = () => (
  <>
    <SettingsCard title="Authentication"
      subtitle="Login policies for admin and business users">
      <SettingsRow label="Admin 2FA required" hint="All admin accounts must enroll in 2FA within 7 days">
        <Toggle on={true}/>
      </SettingsRow>
      <SettingsRow label="Business 2FA optional" hint="Allow business owners to opt in to 2FA">
        <Toggle on={true}/>
      </SettingsRow>
      <SettingsRow label="Session timeout" hint="Idle timeout for admin sessions">
        <Select value="30m" onChange={() => {}}
          options={[{ value: '15m', label: '15 minutes' }, { value: '30m', label: '30 minutes' }, { value: '1h', label: '1 hour' }, { value: '8h', label: '8 hours' }]}/>
      </SettingsRow>
      <SettingsRow label="Password policy">
        <Select value="strong" onChange={() => {}}
          options={[{ value: 'strong', label: 'Strong — 12+ chars, mixed case, number, symbol' }, { value: 'medium', label: 'Medium — 8+ chars' }]}/>
      </SettingsRow>
      <SettingsRow label="IP allowlist" hint="Restrict admin login to specific CIDR ranges" last>
        <Toggle on={false}/>
      </SettingsRow>
    </SettingsCard>

    <SettingsCard title="Audit & rate limiting">
      <SettingsRow label="Audit log retention" hint="How long audit_logs entries are kept">
        <Select value="365d" onChange={() => {}}
          options={[{ value: '90d', label: '90 days' }, { value: '180d', label: '180 days' }, { value: '365d', label: '365 days' }, { value: 'forever', label: 'Forever' }]}/>
      </SettingsRow>
      <SettingsRow label="API rate limit" hint="Requests per minute per business">
        <TextField value="240" mono width={140}/>
      </SettingsRow>
      <SettingsRow label="QR scan rate limit" hint="Per IP, per QR code, per minute" last>
        <TextField value="20" mono width={140}/>
      </SettingsRow>
    </SettingsCard>
  </>
);

// =============================================================
// Usage Limits
// =============================================================
const LimitsSettingsTab = () => (
  <SettingsCard title="Plan limits"
    subtitle="Monthly usage caps enforced per business · changes apply at next billing cycle">
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      <div>Plan</div>
      <div style={{ textAlign: 'right' }}>Reviews / mo</div>
      <div style={{ textAlign: 'right' }}>Scans / mo</div>
      <div style={{ textAlign: 'right' }}>Campaigns</div>
    </div>
    {PLANS.map(p => {
      const l = PLAN_LIMITS[p];
      return (
        <div key={p} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '14px 0', borderBottom: '1px solid var(--border)', alignItems: 'center', fontSize: 13 }}>
          <div><PlanBadge plan={p}/></div>
          <div style={{ textAlign: 'right' }}>
            <input defaultValue={l.reviews === null ? '∞' : l.reviews} style={{ width: 100, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', height: 32, padding: '0 10px', fontVariantNumeric: 'tabular-nums', fontSize: 13, textAlign: 'right', background: 'var(--surface)', color: 'var(--ink)' }}/>
          </div>
          <div style={{ textAlign: 'right' }}>
            <input defaultValue={l.scans === null ? '∞' : l.scans} style={{ width: 100, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', height: 32, padding: '0 10px', fontVariantNumeric: 'tabular-nums', fontSize: 13, textAlign: 'right', background: 'var(--surface)', color: 'var(--ink)' }}/>
          </div>
          <div style={{ textAlign: 'right' }}>
            <input defaultValue={l.campaigns === null ? '∞' : l.campaigns} style={{ width: 80, border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', height: 32, padding: '0 10px', fontVariantNumeric: 'tabular-nums', fontSize: 13, textAlign: 'right', background: 'var(--surface)', color: 'var(--ink)' }}/>
          </div>
        </div>
      );
    })}
    <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--info-soft)', color: 'var(--info-ink)', borderRadius: 'var(--radius-sm)', fontSize: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Ico.ShieldAlert size={14}/>
      <span>Use <code style={{ fontFamily: 'var(--font-mono)' }}>∞</code> for unlimited. Changes write to the <code style={{ fontFamily: 'var(--font-mono)' }}>plan_prices</code> config table and apply at the start of each business's next billing cycle.</span>
    </div>
  </SettingsCard>
);

// =============================================================
// API keys
// =============================================================
const APISettingsTab = () => (
  <>
    <SettingsCard title="Service keys"
      subtitle="Server-side keys used by Reevo to talk to external providers"
      actions={<Button variant="secondary" size="sm" icon={<Ico.Plus size={12}/>}>Rotate all</Button>}>
      {[
        { name: 'Anthropic',         key: 'sk-ant-•••••••••••••••••••••a8H2', updated: 'Feb 12', status: 'active' },
        { name: 'OpenAI (fallback)', key: 'sk-•••••••••••••••••••••8tWp',     updated: 'Jan 28', status: 'active' },
        { name: 'Stripe',            key: 'sk_live_•••••••••••••••3kBg',       updated: 'Jan 04', status: 'active' },
        { name: 'Supabase service',  key: 'eyJhbGciOiJIUzI1NiI•••••••• ',      updated: 'Dec 18', status: 'active' },
        { name: 'Resend',            key: 're_•••••••••••••••gE7q',            updated: 'Dec 03', status: 'active' },
      ].map((k, i, arr) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{k.name}</div>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-2)', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>{k.key}</code>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last rotated <strong style={{ color: 'var(--ink-2)' }}>{k.updated}</strong></span>
          <div style={{ display: 'inline-flex', gap: 6 }}>
            <Button variant="ghost" size="sm" icon={<Ico.Eye size={12}/>}>Reveal</Button>
            <Button variant="ghost" size="sm" icon={<Ico.External size={12}/>}>Rotate</Button>
          </div>
        </div>
      ))}
    </SettingsCard>
  </>
);

Object.assign(window, { SettingsScreen });
