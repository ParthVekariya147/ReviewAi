'use client';

import { Icon, Card, CardHeader, Btn, Badge, Progress, StarRating, Field, Input, Select } from '../ui';

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

function FunnelMockup({ brand }: { brand: { name: string; color: string } }) {
  return (
    <div className="lp-funnel" style={{ background: '#FAFAF7', color: '#0F0F12', fontFamily: 'ui-serif, Georgia, serif' }}>
      <div className="lp-funnel-head">
        <div className="lp-funnel-logo" style={{ background: brand.color, color: '#fff' }}>
          {brand.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
        </div>
        <div className="lp-funnel-biz">{brand.name}</div>
      </div>
      <div className="lp-funnel-body">
        <div className="lp-funnel-h">Thanks for visiting!</div>
        <div className="lp-funnel-sub">We&apos;d love to hear about your experience.</div>
        <div className="lp-funnel-stars-prompt">
          {[1,2,3,4,5].map(i => <span key={i} className="lp-funnel-star-prompt">★</span>)}
        </div>
        <div className="lp-funnel-cta" style={{ background: brand.color, color: '#fff' }}>Rate your visit</div>
      </div>
    </div>
  );
}

const locations = [
  {name:'NW Portland',  addr:'1245 Northbound Ave, Portland OR 97210', rating:4.6, reviews:1284, primary:true},
  {name:'SE Division',  addr:'3820 SE Division St, Portland OR 97202',  rating:4.5, reviews:612,  primary:false},
];

const ratingCounts: Record<number, number> = {5:1421, 4:312, 3:91, 2:38, 1:34};

export default function ScreenProfile() {
  const biz = { name: 'Olive & Pine Bistro', color: '#6366F1', industry: 'Restaurant', owner: 'Maya Okafor' };

  return (
    <div className="lp-page">
      <PageHeader
        title="Business profile"
        sub="Public details, branding & customer-facing identity"
        actions={<Btn variant="primary" icon="check">Save changes</Btn>}
      />

      <div className="lp-grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 16 }}>
        <div className="lp-stack">
          <Card>
            <CardHeader title="Identity"/>
            <div className="lp-flex" style={{ gap: 18, alignItems: 'center' }}>
              <div className="lp-logo-big" style={{ background: biz.color }}>O&P</div>
              <div style={{ flex: 1 }}>
                <Field label="Business name"><Input defaultValue={biz.name}/></Field>
              </div>
            </div>
            <div className="lp-grid lp-grid-2" style={{ marginTop: 14 }}>
              <Field label="Industry"><Select value={biz.industry} options={['Restaurant','Salon','Clinic','Retail','Service','Hospitality']} onChange={() => {}}/></Field>
              <Field label="Founded"><Input defaultValue="2019"/></Field>
              <Field label="Owner"><Input defaultValue={biz.owner}/></Field>
              <Field label="Public email"><Input defaultValue="hello@oliveandpine.co"/></Field>
            </div>
            <Field label="Tagline" hint="Shown on the funnel landing page">
              <Input defaultValue="Wood-fired comfort food, Portland's NW neighborhood since 2019."/>
            </Field>
          </Card>

          <Card>
            <CardHeader title="Locations" action={<Btn variant="ghost" icon="plus" size="sm">Add location</Btn>}/>
            <div className="lp-loc-list">
              {locations.map((l, i) => (
                <div className="lp-loc-row" key={i}>
                  <span className="lp-loc-icon"><Icon name="building" size={16}/></span>
                  <div className="lp-loc-body">
                    <div className="lp-loc-name">
                      {l.name} {l.primary && <Badge tone="primary">Primary</Badge>}
                    </div>
                    <div className="lp-loc-addr">{l.addr}</div>
                  </div>
                  <div className="lp-loc-meta">
                    <StarRating value={Math.round(l.rating)} readonly size={14}/>
                    <div className="lp-muted">{l.rating} · {l.reviews.toLocaleString()} reviews</div>
                  </div>
                  <Btn variant="ghost" icon="more" size="sm"/>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Google review link" subtitle="Used as the destination for completed funnels"/>
            <div className="lp-grid lp-grid-2" style={{ gap: 16 }}>
              <Field label="Google review URL">
                <Input defaultValue="https://g.page/r/oliveandpine/review" icon="link"/>
              </Field>
              <Field label="Status">
                <div className="lp-connect-status is-ok" style={{ marginTop: 0 }}>
                  <span className="lp-connect-status-icon"><Icon name="check" size={14}/></span>
                  <div>
                    <div className="lp-connect-status-title">Connected</div>
                    <div className="lp-connect-status-sub">4.6 ★ · 1,284 reviews</div>
                  </div>
                </div>
              </Field>
            </div>
          </Card>
        </div>

        <div className="lp-stack">
          <Card>
            <CardHeader title="Reputation summary"/>
            <div className="lp-rep-big">
              <div className="lp-rep-big-num">4.6</div>
              <div>
                <StarRating value={5} readonly/>
                <div className="lp-muted">across 1,896 reviews</div>
              </div>
            </div>
            <div className="lp-rep-bars">
              {[5,4,3,2,1].map(r => {
                const tone = r >= 4 ? 'success' : r === 3 ? 'warning' : 'danger';
                return (
                  <div className="lp-rep-bar" key={r}>
                    <span className="lp-rep-bar-num">{r}★</span>
                    <Progress value={ratingCounts[r]} max={1421} tone={tone} height={6}/>
                    <span className="lp-rep-bar-count">{ratingCounts[r]}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Branding preview"/>
            <div className="lp-phone" style={{ margin: '0 auto' }}>
              <FunnelMockup brand={biz}/>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
