'use client';

import { useState, useMemo } from 'react';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Progress, Avatar, Input, Segmented, Select, fmt } from '../ui';

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

export default function ScreenHistory() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allReviews = useMemo(() => {
    const tones = ['warm','professional','casual','enthusiastic'];
    const customers = ['Customer #4821','Customer #4820','Customer #4815','Customer #4807','Customer #4801','Customer #4798','Customer #4790','Customer #4783','Customer #4775','Customer #4768','Customer #4762','Customer #4756'];
    const sources = ['Front Counter','Table Tents','Receipts','Loyalty Email'];
    const devices = ['iPhone 15','Android','iPad','iPhone 14','Android'];
    const countries = ['🇺🇸 US','🇨🇦 CA','🇲🇽 MX','🇬🇧 UK','🇫🇷 FR'];
    const langs = ['English','Spanish','French','English','English'];
    const samples = [
      'Wood-fired pizza was incredible — staff made our anniversary feel special. Back soon!',
      'Cozy atmosphere, fast service and the vegan menu was a delightful surprise.',
      'Best Italian in NW Portland — patio at sunset is unmatched.',
      'Service was warm, the espresso was perfect and the tiramisu blew us away.',
      'Family-friendly, the kids loved the bread service. Owner stopped by our table.',
      'Tucked-away neighborhood gem — definitely worth the trip across town.',
      'The seasonal menu rotates often and the chef knows his stuff.',
      'We were celebrating a promotion and the team made it feel like a real occasion.',
      'Cocktails are creative and the food never misses. New favorite spot.',
      'Quiet vibe, great lighting, and the gnocchi is the best in the city.',
      'Walked in without a reservation — they squeezed us in and treated us like regulars.',
      'Patio heaters made winter dinner cozy. Will recommend to anyone.',
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
      status: i % 11 === 0 ? 'submitted' : i % 9 === 0 ? 'abandoned' : i % 6 === 0 ? 'copied' : 'redirected',
      refreshes: (i * 7) % 4,
      copies: (i * 3) % 3,
    }));
  }, []);

  const filtered = allReviews.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (!search || r.text.toLowerCase().includes(search.toLowerCase()) || r.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const statusTone = (s: string) =>
    s === 'submitted' ? 'success' : s === 'abandoned' ? 'danger' : s === 'copied' ? 'primary' : 'violet';

  return (
    <div className="lp-page">
      <PageHeader
        title="Review history"
        sub="Every AI-assisted customer review your funnel has produced"
        actions={
          <>
            <Btn icon="filter">Filter</Btn>
            <Btn icon="download">Export CSV</Btn>
          </>
        }
      />

      <div className="lp-grid lp-grid-4">
        <Stat label="Reviews generated"      icon="sparkles" value={2384} delta={11.2} tone="primary"/>
        <Stat label="Submitted to Google"     icon="external" value={1845} delta={8.4}  tone="success"/>
        <Stat label="Funnel completion"       icon="check"    value={77.4} suffix="%" decimals={1} delta={3.1} tone="violet"/>
        <Stat label="Conversion (scan→Google)" icon="trendUp" value={49.9} suffix="%" decimals={1} delta={5.4} tone="cyan"/>
      </div>

      <div className="lp-grid lp-grid-3">
        <Stat label="Refresh requests" icon="refresh" value={487} delta={-2.1} tone="warning"/>
        <Stat label="Copy clicks"      icon="copy"    value={892} delta={4.4}  tone="primary"/>
        <Card>
          <CardHeader title="Reviews by country" subtitle="Top 5 locations"/>
          <div className="lp-country-list" style={{ gap: 8 }}>
            {[
              { flag: '🇺🇸', name: 'US',    n: 1742, share: 0.73 },
              { flag: '🇨🇦', name: 'CA',    n: 308,  share: 0.13 },
              { flag: '🇲🇽', name: 'MX',    n: 142,  share: 0.06 },
              { flag: '🇬🇧', name: 'UK',    n: 95,   share: 0.04 },
              { flag: '🌐',  name: 'Other', n: 97,   share: 0.04 },
            ].map(c => (
              <div className="lp-country-row" key={c.name}>
                <span className="lp-country-flag" style={{ fontSize: 14 }}>{c.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="lp-flex lp-flex-between" style={{ fontSize: 11.5 }}>
                    <span>{c.name}</span>
                    <span><b>{fmt(c.n)}</b></span>
                  </div>
                  <Progress value={c.share * 100} tone="primary" height={3}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false}>
        <div className="lp-table-toolbar">
          <Input icon="search" placeholder="Search reviews, customers…" value={search} onChange={(e) => setSearch(e.target.value)}/>
          <Segmented value={filter} onChange={setFilter} options={[
            {value:'all',label:'All'},{value:'redirected',label:'Redirected'},
            {value:'copied',label:'Copied'},{value:'submitted',label:'Submitted'},{value:'abandoned',label:'Abandoned'},
          ]}/>
          <Select value="30d" onChange={() => {}} options={[
            {value:'7d',label:'Last 7 days'},{value:'30d',label:'Last 30 days'},{value:'all',label:'All time'},
          ]}/>
        </div>

        <table className="lp-table lp-table-history">
          <thead>
            <tr>
              <th>Customer</th><th>Review</th><th>★</th>
              <th>Tone · Lang</th><th>Source</th>
              <th>Device · Country</th><th>Status</th><th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 14).map(r => (
              <tr key={r.id}>
                <td>
                  <div className="lp-tcell-main">
                    <Avatar name={r.customer} size={28}/>
                    <div>
                      <div className="lp-tcell-name">{r.customer}</div>
                      <div className="lp-tcell-sub">
                        {r.refreshes > 0 && <span><Icon name="refresh" size={10}/> {r.refreshes}×</span>}
                        {r.copies > 0 && <span style={{ marginLeft: 8 }}><Icon name="copy" size={10}/> {r.copies}×</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="lp-tcell-text">{r.text}</td>
                <td><span style={{ color: 'var(--lp-warning)' }}>★</span> {r.stars}</td>
                <td>
                  <Badge tone="neutral">{r.tone}</Badge>{' '}
                  <span className="lp-muted">{r.lang}</span>
                </td>
                <td><span className="lp-muted">{r.source}</span></td>
                <td>
                  <div>{r.device}</div>
                  <div className="lp-muted" style={{ fontSize: 11 }}>{r.country}</div>
                </td>
                <td><Badge tone={statusTone(r.status) as 'success' | 'danger' | 'primary' | 'violet'} dot>{r.status}</Badge></td>
                <td className="lp-muted">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="lp-table-foot">
          <span className="lp-muted">Showing 1–{Math.min(14, filtered.length)} of {filtered.length}</span>
          <div className="lp-flex" style={{ gap: 6 }}>
            <Btn variant="ghost" size="sm" icon="chevron" style={{ transform: 'scaleX(-1)' }}/>
            <Btn variant="ghost" size="sm" iconRight="chevron"/>
          </div>
        </div>
      </Card>
    </div>
  );
}
