// modals.jsx — Change Plan + Suspend Business confirm modals
// Local modals — render inside the artboard via absolute positioning
// over a backdrop.

const ModalShell = ({ open, onClose, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(15,15,30,0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'rvFadeIn .15s ease-out',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes rvFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes rvSlideIn { from { opacity: 0; transform: translateY(8px) scale(0.985) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width, maxWidth: '90%',
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'rvSlideIn .2s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ title, subtitle, onClose, icon, accent }) => (
  <div style={{ padding: '20px 24px 4px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
    {icon && (
      <span style={{
        width: 40, height: 40, borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: accent === 'danger' ? 'var(--danger-soft)' : 'var(--accent-soft)',
        color: accent === 'danger' ? 'var(--danger)' : 'var(--accent-ink)',
        flex: '0 0 auto',
      }}>{icon}</span>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
    <button onClick={onClose} title="Close"
      style={{
        width: 28, height: 28, border: '1px solid var(--border)',
        background: 'var(--surface)', borderRadius: 8, cursor: 'pointer',
        color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flex: '0 0 auto',
      }}><Ico.X/></button>
  </div>
);

const ModalFooter = ({ children }) => (
  <div style={{
    padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8,
    borderTop: '1px solid var(--border)',
    background: 'var(--bg-soft)',
  }}>{children}</div>
);

// ============================================================
// Change Plan modal
// ============================================================
const ChangePlanModal = ({ open, onClose, businessName = 'Sunrise Bakery & Café', currentPlan = 'pro' }) => {
  const [target, setTarget] = React.useState('enterprise');

  return (
    <ModalShell open={open} onClose={onClose} width={620}>
      <ModalHeader
        icon={<Ico.Sparkles/>}
        title={`Change plan for ${businessName}`}
        subtitle={`Currently on ${currentPlan} · changes apply at the end of the current period unless billed immediately.`}
        onClose={onClose}
      />
      <div style={{ padding: '18px 24px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Select plan</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {PLANS.map(p => {
            const selected = target === p;
            const isCurrent = p === currentPlan;
            const limit = PLAN_LIMITS[p];
            return (
              <button key={p} onClick={() => setTarget(p)}
                style={{
                  textAlign: 'left', padding: 12,
                  borderRadius: 'var(--radius-sm)',
                  border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border-strong)'}`,
                  background: selected ? 'var(--accent-soft)' : 'var(--surface)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 6,
                  position: 'relative',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <PlanBadge plan={p}/>
                  {isCurrent && <span style={{ fontSize: 9.5, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current</span>}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {limit.price_cents === 0 ? 'Free' : `$${limit.price_cents/100}`}
                  {limit.price_cents > 0 && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>/mo</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Plan limits comparison */}
        <div style={{
          marginTop: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', background: 'var(--bg-soft)', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>
            <div>Plan limit</div>
            <div style={{ textAlign: 'right' }}>Reviews / mo</div>
            <div style={{ textAlign: 'right' }}>Scans / mo</div>
            <div style={{ textAlign: 'right' }}>Campaigns</div>
          </div>
          {PLANS.map(p => {
            const l = PLAN_LIMITS[p];
            const selected = p === target;
            return (
              <div key={p} style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
                padding: '10px 12px', fontSize: 13,
                background: selected ? 'var(--accent-soft)' : 'transparent',
                fontWeight: selected ? 600 : 400,
                color: 'var(--ink)',
                borderTop: '1px solid var(--border)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PlanBadge plan={p}/>
                </div>
                <div style={{ textAlign: 'right' }}>{l.reviews   === null ? 'Unlimited' : l.reviews.toLocaleString()}</div>
                <div style={{ textAlign: 'right' }}>{l.scans     === null ? 'Unlimited' : l.scans.toLocaleString()}</div>
                <div style={{ textAlign: 'right' }}>{l.campaigns === null ? 'Unlimited' : l.campaigns}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 16, padding: '10px 12px',
          background: 'var(--info-soft)', color: 'var(--info-ink)',
          border: '1px solid transparent',
          borderRadius: 'var(--radius-sm)', fontSize: 12,
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <span style={{ marginTop: 1 }}><Ico.ShieldAlert size={14}/></span>
          <div>An audit log entry will be written: <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>plan.changed</code> · from <strong>{currentPlan}</strong> to <strong>{target}</strong></div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" disabled={target === currentPlan}>
          Confirm change to {target}
        </Button>
      </ModalFooter>
    </ModalShell>
  );
};

// ============================================================
// Suspend Business confirm dialog
// ============================================================
const SuspendBusinessModal = ({ open, onClose, businessName = 'Vesper Wine Bar' }) => {
  const [reason, setReason] = React.useState('');
  return (
    <ModalShell open={open} onClose={onClose} width={500}>
      <ModalHeader
        icon={<Ico.ShieldAlert/>}
        accent="danger"
        title={`Suspend ${businessName}?`}
        subtitle="The business owner will be logged out, all live QR codes will fall back to a 'paused' page, and a record will be written to the audit log."
        onClose={onClose}
      />
      <div style={{ padding: '4px 24px 20px' }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6, marginTop: 12 }}>
          Suspension reason <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. chargeback dispute filed by issuing bank — pending resolution"
          rows={3}
          style={{
            width: '100%', resize: 'vertical',
            padding: '10px 12px', fontSize: 13,
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--ink)',
            outline: 'none',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1.5,
          }}/>
        <div style={{
          marginTop: 14, padding: '10px 12px',
          background: 'var(--danger-soft)', color: 'var(--danger-ink)',
          borderRadius: 'var(--radius-sm)', fontSize: 12,
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <span style={{ marginTop: 1 }}><Ico.ShieldAlert size={14}/></span>
          <div>
            This action <strong>cannot be undone in bulk</strong>. To reactivate, you must restore the business individually from its detail view.
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" disabled={reason.trim().length < 4}>
          Suspend business
        </Button>
      </ModalFooter>
    </ModalShell>
  );
};

Object.assign(window, { ModalShell, ModalHeader, ModalFooter, ChangePlanModal, SuspendBusinessModal });
