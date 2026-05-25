'use client';

import { useEffect, useState, useCallback } from 'react';
import { MdEdit, MdCheck, MdClose, MdPeople, MdAttachMoney, MdTrendingUp } from 'react-icons/md';
import AdminTopbar from '../../_components/shell/topbar';
import PlanBadge from '../../_components/badges/plan-badge';
import type { Plan } from '@/types/admin';

interface PlanRow {
  plan: Plan;
  amount_cents: number;
  currency: string;
  updated_at: string;
  business_count: number;
  mrr_cents: number;
}

function fmtMoney(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const PLAN_FEATURES: Record<Plan, string[]> = {
  free:       ['1 QR code', '50 scans/mo', 'Basic AI drafts', 'Public landing page'],
  starter:    ['5 QR codes', '500 scans/mo', 'AI drafts (2/scan)', 'Custom branding', 'Analytics'],
  pro:        ['Unlimited QR', '5,000 scans/mo', 'A/B testing', 'Priority AI', 'Advanced analytics', 'Webhooks'],
  enterprise: ['Unlimited everything', 'Custom limits', 'SLA support', 'SSO/SAML', 'Audit logs', 'Dedicated CSM'],
};

const PLAN_ORDER: Plan[] = ['free', 'starter', 'pro', 'enterprise'];

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/plans');
    if (res.ok) {
      const json = await res.json();
      setPlans(json.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(plan: PlanRow) {
    setEditing(plan.plan);
    setDraftPrice((plan.amount_cents / 100).toFixed(2));
    setSaveError('');
  }

  function cancelEdit() {
    setEditing(null);
    setDraftPrice('');
    setSaveError('');
  }

  async function savePrice(plan: Plan) {
    const amount_cents = Math.round(parseFloat(draftPrice) * 100);
    if (isNaN(amount_cents) || amount_cents < 0) {
      setSaveError('Enter a valid price');
      return;
    }
    setSaving(true);
    setSaveError('');
    const res = await fetch('/api/admin/plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, amount_cents }),
    });
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      const j = await res.json().catch(() => ({}));
      setSaveError(j.error ?? 'Failed to save');
    }
    setSaving(false);
  }

  const totalBusinesses = plans.reduce((s, p) => s + p.business_count, 0) || 1;
  const totalMrr = plans.reduce((s, p) => s + p.mrr_cents, 0);

  const orderedPlans = PLAN_ORDER.map(p => plans.find(r => r.plan === p)).filter(Boolean) as PlanRow[];

  return (
    <>
      <AdminTopbar breadcrumbs={['Admin', 'Subscriptions', 'Plan Config']} pageTitle="Plan Configuration"/>

      <main style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>

        {/* MRR summary strip */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { icon: <MdAttachMoney size={18}/>, label: 'Total Est. MRR', value: fmtMoney(totalMrr), accent: true },
            { icon: <MdPeople size={18}/>, label: 'Total Businesses', value: totalBusinesses.toLocaleString(), accent: false },
            { icon: <MdTrendingUp size={18}/>, label: 'Paid Ratio', value: `${Math.round(((totalBusinesses - (plans.find(p => p.plan === 'free')?.business_count ?? 0)) / totalBusinesses) * 100)}%`, accent: false },
          ].map(item => (
            <div key={item.label} style={{
              background: item.accent ? 'var(--accent)' : 'var(--surface)',
              border: `1px solid ${item.accent ? 'transparent' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              minWidth: 170,
            }}>
              <span style={{ color: item.accent ? 'rgba(255,255,255,0.8)' : 'var(--muted)' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: item.accent ? 'rgba(255,255,255,0.7)' : 'var(--muted)', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.accent ? '#fff' : 'var(--ink)' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plan cards grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 320, borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border)', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }}/>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {orderedPlans.map(plan => {
              const isEditing = editing === plan.plan;
              const pct = Math.round((plan.business_count / totalBusinesses) * 100);

              return (
                <div key={plan.plan} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${plan.plan === 'pro' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'relative',
                }}>
                  {plan.plan === 'pro' && (
                    <span style={{
                      position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700,
                      padding: '2px 10px', borderRadius: 100, letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>Most Popular</span>
                  )}

                  {/* Plan header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <PlanBadge plan={plan.plan}/>
                    {plan.plan !== 'free' && (
                      <button
                        onClick={() => isEditing ? cancelEdit() : startEdit(plan)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4, display: 'flex', borderRadius: 6 }}
                        title={isEditing ? 'Cancel' : 'Edit price'}
                      >
                        {isEditing ? <MdClose size={16}/> : <MdEdit size={16}/>}
                      </button>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 18, color: 'var(--ink)', fontWeight: 700 }}>$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draftPrice}
                          onChange={e => setDraftPrice(e.target.value)}
                          autoFocus
                          style={{ width: 90, padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--accent)', background: 'var(--bg-tint)', color: 'var(--ink)', fontSize: 16, fontWeight: 700 }}
                          onKeyDown={e => { if (e.key === 'Enter') savePrice(plan.plan); if (e.key === 'Escape') cancelEdit(); }}
                        />
                        <span style={{ fontSize: 13, color: 'var(--muted)' }}>/mo</span>
                        <button
                          onClick={() => savePrice(plan.plan)}
                          disabled={saving}
                          style={{ marginLeft: 2, padding: '5px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <MdCheck size={16}/>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>
                          {plan.amount_cents === 0 ? 'Free' : fmtMoney(plan.amount_cents, plan.currency)}
                        </span>
                        {plan.amount_cents > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>/mo</span>
                        )}
                      </div>
                    )}
                    {saveError && isEditing && (
                      <p style={{ fontSize: 11, color: '#991B1B', marginTop: 4 }}>{saveError}</p>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                      Last updated {fmtDate(plan.updated_at)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>Businesses</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{plan.business_count.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>MRR</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: plan.mrr_cents > 0 ? 'var(--accent-ink)' : 'var(--muted-2)' }}>
                        {plan.mrr_cents > 0 ? fmtMoney(plan.mrr_cents, plan.currency) : '—'}
                      </div>
                    </div>
                  </div>

                  {/* Distribution bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>% of all users</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: plan.plan === 'pro' ? 'var(--accent)' : plan.plan === 'enterprise' ? 'linear-gradient(90deg, var(--accent), #7C3AED)' : 'var(--ink-2)',
                        borderRadius: 100,
                        transition: 'width 0.5s ease',
                      }}/>
                    </div>
                  </div>

                  {/* Features */}
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {PLAN_FEATURES[plan.plan].map(f => (
                      <li key={f} style={{ fontSize: 12, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ color: plan.plan === 'pro' ? 'var(--accent)' : 'var(--muted)', fontSize: 9 }}>●</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
          Price edits update <code>plan_prices</code> table and are reflected in billing immediately. Only super_admin can edit prices.
        </p>
      </main>
    </>
  );
}
