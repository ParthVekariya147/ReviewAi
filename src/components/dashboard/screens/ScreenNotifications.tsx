'use client';

import { useCallback } from 'react';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon, Card, CardHeader, Btn, Badge, Tabs, Switch, Empty } from '../ui';
import type { NotifItem } from '@/app/api/notifications/route';
import type { NotifPreferences } from '@/app/api/notifications/preferences/route';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="lp-page-hd">
      <div>
        <h1 className="lp-h1">{title}</h1>
        {sub && <div className="lp-page-sub">{sub}</div>}
      </div>
      {actions && <div className="lp-page-act">{actions}</div>}
    </div>
  );
}

type PrefKey = keyof NotifPreferences;

const PREF_DEFS: { key: PrefKey; title: string; sub: string }[] = [
  { key: 'new_5star',          title: 'New 5★ reviews',      sub: 'Push + email'  },
  { key: 'low_ratings',        title: 'Low ratings captured', sub: 'Email only'    },
  { key: 'quota_alerts',       title: 'Quota alerts',         sub: 'Email + SMS'   },
  { key: 'funnel_performance', title: 'Funnel performance',   sub: 'Weekly digest' },
  { key: 'team_activity',      title: 'Team activity',        sub: 'Push'          },
  { key: 'billing_invoices',   title: 'Billing & invoices',   sub: 'Email'         },
  { key: 'product_updates',    title: 'Product updates',      sub: 'Email'         },
];

const PREF_DEFAULTS: NotifPreferences = {
  new_5star: true, low_ratings: true, quota_alerts: true,
  funnel_performance: false, team_activity: false,
  billing_invoices: true, product_updates: false,
};

export default function ScreenNotifications() {
  const [tab, setTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: meData } = useQuery<{ email: string; name: string }>({
    queryKey: ['/api/auth/me'],
    queryFn:  () => fetcher('/api/auth/me'),
  });
  const ownerEmail = meData?.email ?? '';

  const { data: notifData, isLoading } = useQuery<{
    notifications: NotifItem[];
    unreadCount: number;
  }>({
    queryKey: ['/api/notifications'],
    queryFn:  () => fetcher('/api/notifications'),
    refetchInterval: 60_000,
  });

  const { data: prefData } = useQuery<{ preferences: NotifPreferences }>({
    queryKey: ['/api/notifications/preferences'],
    queryFn:  () => fetcher('/api/notifications/preferences'),
  });

  const prefs = prefData?.preferences ?? PREF_DEFAULTS;
  const allItems = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const filtered =
    tab === 'all'    ? allItems :
    tab === 'unread' ? allItems.filter(n => n.unread) :
                       allItems.filter(n => n.cat === tab);

  async function markRead(id: string) {
    queryClient.setQueryData(
      ['/api/notifications'],
      (prev: { notifications: NotifItem[]; unreadCount: number } | undefined) => {
        if (!prev) return prev;
        const wasUnread = prev.notifications.find(n => n.id === id)?.unread ?? false;
        return {
          ...prev,
          notifications: prev.notifications.map(n => n.id === id ? { ...n, unread: false } : n),
          unreadCount: Math.max(0, prev.unreadCount - (wasUnread ? 1 : 0)),
        };
      },
    );
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
  }

  async function markAllRead() {
    const unreadIds = allItems.filter(n => n.unread).map(n => n.id);
    if (unreadIds.length === 0) return;

    queryClient.setQueryData(
      ['/api/notifications'],
      (prev: { notifications: NotifItem[]; unreadCount: number } | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, unread: false })),
          unreadCount: 0,
        };
      },
    );
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: unreadIds }),
    });
  }

  const handlePrefChange = useCallback(async (key: PrefKey, value: boolean) => {
    queryClient.setQueryData(
      ['/api/notifications/preferences'],
      (prev: { preferences: NotifPreferences } | undefined) => ({
        preferences: { ...(prev?.preferences ?? PREF_DEFAULTS), [key]: value },
      }),
    );
    await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
  }, [queryClient]);

  return (
    <div className="lp-page">
      <PageHeader
        title="Notifications"
        sub={`${unreadCount} unread · all your funnel activity in one place`}
        actions={<Btn icon="check" onClick={markAllRead}>Mark all read</Btn>}
      />

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
        <Card padded={false}>
          <div style={{ padding: '16px 20px 0' }}>
            <Tabs value={tab} onChange={setTab} tabs={[
              { value: 'all',     label: `All · ${allItems.length}` },
              { value: 'unread',  label: `Unread · ${unreadCount}` },
              { value: 'reviews', label: 'Reviews' },
              { value: 'alerts',  label: 'Alerts' },
              { value: 'system',  label: 'System' },
            ]}/>
          </div>
          <div className="lp-notif-list">
            {isLoading ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--lp-fg-muted)', fontSize: 13 }}>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <Empty icon="bell" title="All caught up" sub="You'll see new notifications here when activity happens."/>
            ) : (
              filtered.map(n => (
                <button
                  key={n.id}
                  className={`lp-notif ${n.unread ? 'is-unread' : ''}`}
                  onClick={() => n.unread && markRead(n.id)}
                >
                  <span className={`lp-notif-icon lp-tone-${n.tone}`}>
                    <Icon name={n.icon as Parameters<typeof Icon>[0]['name']} size={14}/>
                  </span>
                  <div className="lp-notif-body">
                    <div className="lp-notif-title">{n.title}</div>
                    <div className="lp-notif-text">{n.body}</div>
                    <div className="lp-notif-time">{n.time}</div>
                  </div>
                  {n.unread && <span className="lp-notif-dot"/>}
                </button>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Delivery preferences"/>
          <div className="lp-stack" style={{ gap: 12 }}>
            {PREF_DEFS.map(({ key, title, sub }) => (
              <div key={key} className="lp-flex lp-flex-between" style={{ alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13 }}>{title}</div>
                  <div className="lp-muted" style={{ fontSize: 11 }}>{sub}</div>
                </div>
                <Switch checked={prefs[key]} onChange={v => handlePrefChange(key, v)}/>
              </div>
            ))}
          </div>
          <div className="lp-divider"/>
          <div className="lp-stack" style={{ gap: 8 }}>
            <div className="lp-eyebrow">Channels</div>
            <div className="lp-flex lp-flex-between">
              <span><Icon name="mail" size={14}/> Email</span>
              <span className="lp-muted">{ownerEmail || '—'}</span>
            </div>
            <div className="lp-flex lp-flex-between">
              <span><Icon name="bell" size={14}/> Push</span>
              <Badge tone="success" dot>On</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
