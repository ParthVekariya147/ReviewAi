'use client';

import { useEffect, useState } from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';
import AdminTopbar from '../../_components/shell/topbar';
import ConfirmActionModal from '../../_components/modals/confirm-action-modal';
import type { AdminUser, AdminRole } from '@/types/admin';

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: '#7C3AED',
  admin:       'var(--accent-ink)',
  support:     'var(--muted)',
};

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState(false);

  async function load() {
    const res = await fetch('/api/admin/settings/admin-users');
    if (res.ok) { const d = await res.json(); setAdmins(d.data ?? []); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    const res = await fetch('/api/admin/settings/admin-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const json = await res.json();
    if (!res.ok) { setInviteError(json.error); }
    else { setInviteEmail(''); load(); }
    setInviting(false);
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    await fetch(`/api/admin/settings/admin-users/${removeTarget.id}`, { method: 'DELETE' });
    setRemoving(false);
    setRemoveTarget(null);
    load();
  }

  async function handleRoleChange(admin: AdminUser, newRole: AdminRole) {
    await fetch(`/api/admin/settings/admin-users/${admin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    load();
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <>
      <AdminTopbar breadcrumbs={['Admin', 'Settings', 'Admin Users']} pageTitle="Admin Users"/>

      <main style={{ padding: '28px 32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Invite form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Invite admin user</div>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Email</label>
              <input
                type="email" required value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="admin@company.com"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-strong)', background: 'var(--bg)', color: 'var(--ink)', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value as AdminRole)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer' }}>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <button type="submit" disabled={inviting} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 'var(--radius-sm)', border: 'none',
              background: 'linear-gradient(135deg,#6E5BFF 0%,#2F7DFB 100%)',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: inviting ? 'not-allowed' : 'pointer', opacity: inviting ? 0.7 : 1,
            }}>
              <MdAdd size={16}/>{inviting ? 'Inviting…' : 'Invite'}
            </button>
          </form>
          {inviteError && <div style={{ marginTop: 10, fontSize: 13, color: '#991B1B' }}>{inviteError}</div>}
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
            The user must already have a Supabase account (signed up at /signup). This grants them admin access.
          </div>
        </div>

        {/* Admin users table */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 600 }}>
            Admin users ({admins.length})
          </div>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', height: 52, background: 'var(--surface-2)', animation: 'pulse 1.4s infinite' }}/>
            ))
          ) : admins.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No admin users yet.</div>
          ) : admins.map(admin => (
            <div key={admin.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{admin.email}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Added {fmtDate(admin.created_at)}</div>
              </div>
              <select
                value={admin.role}
                onChange={e => handleRoleChange(admin, e.target.value as AdminRole)}
                style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border)',
                  background: 'var(--surface)', fontSize: 12, fontWeight: 600,
                  color: ROLE_COLORS[admin.role], cursor: 'pointer',
                }}
              >
                <option value="support">Support</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button onClick={() => setRemoveTarget(admin)} style={{ color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <MdDelete size={16}/>
              </button>
            </div>
          ))}
        </div>
      </main>

      <ConfirmActionModal
        open={!!removeTarget}
        title={`Remove ${removeTarget?.email}?`}
        description="This revokes their admin access immediately. They keep their regular user account."
        confirmLabel="Remove admin"
        dangerous
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </>
  );
}
