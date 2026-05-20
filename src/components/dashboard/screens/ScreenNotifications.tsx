'use client';

import { useState } from 'react';
import { Icon, Card, CardHeader, Btn, Badge, Tabs, Switch, Empty } from '../ui';

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

function NotifPref({ title, sub, defaultOn = false }: { title: string; sub: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="lp-flex lp-flex-between" style={{ alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 13 }}>{title}</div>
        <div className="lp-muted" style={{ fontSize: 11 }}>{sub}</div>
      </div>
      <Switch checked={on} onChange={setOn}/>
    </div>
  );
}

type NotifItem = {
  id: number; icon: string; tone: string; title: string;
  body: string; time: string; unread: boolean; cat: string;
};

const INITIAL_ITEMS: NotifItem[] = [
  {id:1, icon:'star',     tone:'success', title:'New 5★ review submitted',     body:'Customer #4821 just submitted a 5-star review for NW Portland.', time:'2 min ago',  unread:true,  cat:'reviews'},
  {id:2, icon:'trendUp',  tone:'primary', title:'Funnel A is outperforming',    body:'Front Counter funnel up 12% week-over-week.',                    time:'1 hr ago',   unread:true,  cat:'system'},
  {id:3, icon:'qr',       tone:'violet',  title:'New QR campaign published',    body:'Patio Event campaign is live and accepting scans.',               time:'3 hr ago',   unread:true,  cat:'system'},
  {id:4, icon:'package',  tone:'cyan',    title:'Your printed materials shipped',body:'50× table tents shipped via UPS · arrives Wed May 22.',           time:'Yesterday',  unread:false, cat:'system'},
  {id:5, icon:'flag',     tone:'warning', title:'Low rating captured privately', body:'A 2★ rating was held back from Google and sent to your inbox.',   time:'Yesterday',  unread:false, cat:'alerts'},
  {id:6, icon:'bell',     tone:'warning', title:"You're at 75% of quota",        body:'1,875 / 2,500 reviews used this month.',                          time:'2 days ago', unread:false, cat:'alerts'},
  {id:7, icon:'card',     tone:'neutral', title:'Invoice paid',                  body:'INV-2026-05-001 · $49.00',                                        time:'May 1',      unread:false, cat:'billing'},
  {id:8, icon:'team',     tone:'primary', title:'Jordan joined your team',       body:'Accepted invite to manage QR campaigns.',                         time:'Apr 28',     unread:false, cat:'system'},
  {id:9, icon:'star',     tone:'success', title:'10 new reviews this week',      body:'Olive & Pine reached a 4.6★ average across 1,896 reviews.',       time:'Apr 26',     unread:false, cat:'reviews'},
];

export default function ScreenNotifications() {
  const [tab, setTab] = useState('all');
  const [items, setItems] = useState<NotifItem[]>(INITIAL_ITEMS);

  const filtered = tab === 'all' ? items : tab === 'unread' ? items.filter(i => i.unread) : items.filter(i => i.cat === tab);
  const unreadCount = items.filter(i => i.unread).length;
  const markRead = (id: number) => setItems(items.map(i => i.id === id ? {...i, unread:false} : i));
  const markAllRead = () => setItems(items.map(i => ({...i, unread:false})));

  return (
    <div className="lp-page">
      <PageHeader
        title="Notifications"
        sub={`${unreadCount} unread · all your funnel activity in one place`}
        actions={
          <>
            <Btn icon="check" onClick={markAllRead}>Mark all read</Btn>
            <Btn icon="cog">Preferences</Btn>
          </>
        }
      />

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 16, alignItems: 'start' }}>
        <Card padded={false}>
          <div style={{ padding: '16px 20px 0' }}>
            <Tabs value={tab} onChange={setTab} tabs={[
              {value:'all',     label:`All · ${items.length}`},
              {value:'unread',  label:`Unread · ${unreadCount}`},
              {value:'reviews', label:'Reviews'},
              {value:'alerts',  label:'Alerts'},
              {value:'billing', label:'Billing'},
              {value:'system',  label:'System'},
            ]}/>
          </div>
          <div className="lp-notif-list">
            {filtered.length === 0
              ? <Empty icon="bell" title="All caught up" sub="You'll see new notifications here when activity happens."/>
              : filtered.map(n => (
                <button key={n.id} className={`lp-notif ${n.unread ? 'is-unread' : ''}`} onClick={() => markRead(n.id)}>
                  <span className={`lp-notif-icon lp-tone-${n.tone}`}><Icon name={n.icon as Parameters<typeof Icon>[0]['name']} size={14}/></span>
                  <div className="lp-notif-body">
                    <div className="lp-notif-title">{n.title}</div>
                    <div className="lp-notif-text">{n.body}</div>
                    <div className="lp-notif-time">{n.time}</div>
                  </div>
                  {n.unread && <span className="lp-notif-dot"/>}
                </button>
              ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Delivery preferences"/>
          <div className="lp-stack" style={{ gap: 12 }}>
            <NotifPref title="New 5★ reviews"          sub="Push + email"    defaultOn/>
            <NotifPref title="Low ratings captured"     sub="Email only"      defaultOn/>
            <NotifPref title="Quota alerts"             sub="Email + SMS"     defaultOn/>
            <NotifPref title="Funnel performance"       sub="Weekly digest"/>
            <NotifPref title="Team activity"            sub="Push"/>
            <NotifPref title="Billing & invoices"       sub="Email"           defaultOn/>
            <NotifPref title="Product updates"          sub="Email"/>
          </div>
          <div className="lp-divider"/>
          <div className="lp-stack" style={{ gap: 8 }}>
            <div className="lp-eyebrow">Channels</div>
            <div className="lp-flex lp-flex-between">
              <span><Icon name="mail" size={14}/> Email</span>
              <span className="lp-muted">maya@oliveandpine.co</span>
            </div>
            <div className="lp-flex lp-flex-between">
              <span><Icon name="smartphone" size={14}/> SMS</span>
              <span className="lp-muted">+1 (503) ••• 0182</span>
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
