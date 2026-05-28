'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Icon, Card, CardHeader, Btn, Badge, Stat, Progress, Input, Segmented, Select, fmt } from '../ui';

const fetcher = (url: string) =>
  fetch(url).then(r => { if (!r.ok) throw new Error('fetch failed'); return r.json(); });

// ── helpers ──────────────────────────────────────────────────

function timeAgo(ts: string): string {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusTone(s: string): 'success' | 'danger' | 'primary' | 'violet' | 'neutral' {
  switch (s) {
    case 'submitted': return 'success';
    case 'abandoned': return 'danger';
    case 'copied':    return 'primary';
    case 'redirected':return 'violet';
    default:          return 'neutral';
  }
}

function countryFlag(iso: string): string {
  if (!iso || iso.length !== 2) return '🌐';
  return iso.toUpperCase().split('').map(
    c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65),
  ).join('');
}

function countryName(iso: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso.toUpperCase()) ?? iso;
  } catch { return iso; }
}

// ── types ─────────────────────────────────────────────────────

interface Review {
  id:            string;
  qr_id:         string;
  campaign_name: string;
  rating:        number;
  ai_text:       string;
  refreshes:     number;
  copies:        number;
  status:        string;
  created_at:    string;
}

interface SummaryData {
  totals:     Record<string, number>;
  by_country: { country: string; count: number }[];
}

// ── sub-components ───────────────────────────────────────────

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

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: 'var(--lp-warning)', letterSpacing: -1, fontSize: 13 }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  );
}

// ── Private feedback card ─────────────────────────────────────

function PrivateFeedbackCard({ r }: { r: Review }) {
  const ratingColor = r.rating <= 2 ? 'var(--lp-danger)' : r.rating === 3 ? 'var(--lp-warning)' : 'var(--lp-success)';
  return (
    <div style={{
      border: '1px solid var(--lp-border)', borderRadius: 10, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
      borderLeft: `3px solid ${ratingColor}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Stars n={r.rating} />
          <Badge tone={r.rating <= 2 ? 'danger' : r.rating === 3 ? 'warning' : 'success'} dot>
            {r.rating <= 2 ? 'Low rating' : r.rating === 3 ? 'Neutral' : 'Positive'}
          </Badge>
        </div>
        <span style={{ fontSize: 11, color: 'var(--lp-fg-muted)', whiteSpace: 'nowrap' }}>
          {timeAgo(r.created_at)}
        </span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: 'var(--lp-fg)' }}>
        {r.ai_text || <span style={{ color: 'var(--lp-fg-muted)', fontStyle: 'italic' }}>No written feedback provided.</span>}
      </p>
      <div style={{ fontSize: 11, color: 'var(--lp-fg-muted)' }}>
        <Icon name="qr" size={10} /> {r.campaign_name}
      </div>
    </div>
  );
}

// ── main component ───────────────────────────────────────────

export default function ScreenHistory() {
  const searchParams = useSearchParams();
  const [mainTab, setMainTab] = useState<'reviews' | 'private'>('reviews');
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState('all');
  const [days,   setDays]   = useState('30');
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [draft,  setDraft]  = useState(() => searchParams.get('q') ?? '');

  // Sync with URL ?q= param if it changes
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setSearch(q);
    setDraft(q);
  }, [searchParams]);

  // private feedback pagination
  const [pvPage, setPvPage] = useState(1);
  const [pvDays, setPvDays] = useState('30');

  const perPage = 20;

  const reviewsKey = `/api/reviews?page=${page}&per_page=${perPage}&status=${status}&days=${days}&search=${encodeURIComponent(search)}`;
  const summaryKey = `/api/analytics/summary?days=${days === 'all' ? 90 : parseInt(days)}`;
  const privateKey = `/api/reviews?page=${pvPage}&per_page=${perPage}&status=private_feedback&days=${pvDays}`;

  const { data: reviewsData, isLoading, error: reviewsError, refetch: reviewsRefetch } = useQuery<{ reviews: Review[]; total: number; page: number }>({
    queryKey: [reviewsKey],
    queryFn:  () => fetcher(reviewsKey),
  });
  const { data: summaryData } = useQuery<SummaryData>({
    queryKey: [summaryKey],
    queryFn:  () => fetcher(summaryKey),
  });
  const { data: privateData, isLoading: pvLoading } = useQuery<{ reviews: Review[]; total: number }>({
    queryKey: [privateKey],
    queryFn:  () => fetcher(privateKey),
  });

  const t              = summaryData?.totals ?? {};
  const generatesRaw   = t['generate'] ?? 0;  // unique sessions — used for completion rate denominator
  const refreshes      = t['refresh']  ?? 0;
  const generates      = generatesRaw + refreshes;  // total review texts shown to customers
  const completes      = t['complete'] ?? 0;
  const copies         = t['copy']     ?? 0;
  const scans          = t['scan']     ?? 0;
  const completion     = generatesRaw > 0 ? Math.round((completes / generatesRaw) * 1000) / 10 : 0;
  const conversion     = scans > 0        ? Math.round((completes / scans)        * 1000) / 10 : 0;

  const reviews    = reviewsData?.reviews ?? [];
  const total      = reviewsData?.total   ?? 0;
  const totalPages = Math.ceil(total / perPage);
  const from       = (page - 1) * perPage + 1;
  const to         = Math.min(page * perPage, total);

  const privateItems  = privateData?.reviews ?? [];
  const privateTotal  = privateData?.total   ?? 0;
  const pvTotalPages  = Math.ceil(privateTotal / perPage);

  function applySearch() { setSearch(draft); setPage(1); }
  function changeStatus(v: string) { setStatus(v); setPage(1); }
  function changeDays(v: string)   { setDays(v);   setPage(1); }

  return (
    <div className="lp-page">
      <PageHeader
        title="Review history"
        sub="Every AI-assisted review your funnel has produced"
        actions={
          <>
            <Btn icon="download">Export CSV</Btn>
          </>
        }
      />

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--lp-border)', marginBottom: 4 }}>
        {[
          { key: 'reviews', label: 'Public reviews' },
          { key: 'private', label: `Private feedback${privateTotal > 0 ? ` · ${privateTotal}` : ''}` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key as 'reviews' | 'private')}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none',
              cursor: 'pointer', borderBottom: mainTab === t.key ? '2px solid var(--lp-primary)' : '2px solid transparent',
              color: mainTab === t.key ? 'var(--lp-primary)' : 'var(--lp-fg-muted)',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === 'reviews' ? (
        <>
          {/* KPI row 1 */}
          <div className="lp-grid lp-grid-4">
            <Stat label="Reviews generated"       icon="sparkles" value={generates} tone="primary" />
            <Stat label="Submitted to Google"     icon="external" value={completes} tone="success" />
            <Stat label="Funnel completion"       icon="check"    value={completion} suffix="%" decimals={1} tone="violet" />
            <Stat label="Conversion (scan→Google)" icon="trendUp" value={conversion} suffix="%" decimals={1} tone="cyan" />
          </div>

          {/* KPI row 2 + country */}
          <div className="lp-grid lp-grid-3">
            <Stat label="Refresh requests" icon="refresh" value={refreshes} tone="warning" />
            <Stat label="Copy clicks"      icon="copy"    value={copies}    tone="primary" />

            <Card>
              <CardHeader title="Reviews by country" subtitle="Top locations" />
              <div className="lp-country-list" style={{ gap: 8 }}>
                {(summaryData?.by_country ?? []).length === 0 ? (
                  <div style={{ padding: '12px 0', color: 'var(--lp-fg-muted)', fontSize: 13 }}>No data yet</div>
                ) : (summaryData?.by_country ?? []).map(c => {
                  const topCount = summaryData!.by_country[0].count || 1;
                  return (
                    <div className="lp-country-row" key={c.country}>
                      <span className="lp-country-flag" style={{ fontSize: 14 }}>{countryFlag(c.country)}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="lp-flex lp-flex-between" style={{ fontSize: 11.5 }}>
                          <span>{countryName(c.country)}</span>
                          <span><b>{fmt(c.count)}</b></span>
                        </div>
                        <Progress value={(c.count / topCount) * 100} tone="primary" height={3} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Review table */}
          <Card padded={false}>
            <div className="lp-table-toolbar">
              <div className="lp-flex" style={{ gap: 6, flex: 1 }}>
                <Input
                  icon="search"
                  placeholder="Search review text…"
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applySearch()}
                />
                <Btn variant="ghost" size="sm" onClick={applySearch}>Search</Btn>
              </div>
              <Segmented
                value={status}
                onChange={changeStatus}
                options={[
                  { value: 'all',       label: 'All'       },
                  { value: 'redirected',label: 'Redirected'},
                  { value: 'copied',    label: 'Copied'    },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'abandoned', label: 'Abandoned' },
                ]}
              />
              <Select
                value={days}
                onChange={changeDays}
                options={[
                  { value: '7',  label: 'Last 7 days'  },
                  { value: '30', label: 'Last 30 days' },
                  { value: '90', label: 'Last 90 days' },
                  { value: 'all',label: 'All time'     },
                ]}
              />
            </div>

            {isLoading ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
                Loading reviews…
              </div>
            ) : reviewsError ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
                <div style={{ marginBottom: 12 }}>Could not load reviews.</div>
                <Btn variant="ghost" size="sm" onClick={() => reviewsRefetch()}>Retry</Btn>
              </div>
            ) : reviews.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
                {search || status !== 'all' ? 'No reviews match this filter.' : 'No reviews yet — share a QR code to start collecting data.'}
              </div>
            ) : (
              <table className="lp-table lp-table-history">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Review</th>
                    <th>★</th>
                    <th>Engagement</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="lp-tcell-name">{r.campaign_name}</div>
                      </td>
                      <td className="lp-tcell-text" style={{ maxWidth: 340 }}>
                        <span title={r.ai_text}>
                          {r.ai_text.length > 100 ? r.ai_text.slice(0, 100) + '…' : r.ai_text}
                        </span>
                      </td>
                      <td><Stars n={r.rating} /></td>
                      <td>
                        <div className="lp-flex" style={{ gap: 10, fontSize: 12 }}>
                          {r.refreshes > 0 && (
                            <span className="lp-muted"><Icon name="refresh" size={10} /> {r.refreshes}×</span>
                          )}
                          {r.copies > 0 && (
                            <span className="lp-muted"><Icon name="copy" size={10} /> {r.copies}×</span>
                          )}
                          {r.refreshes === 0 && r.copies === 0 && <span className="lp-muted">—</span>}
                        </div>
                      </td>
                      <td>
                        <Badge tone={statusTone(r.status)} dot>{r.status}</Badge>
                      </td>
                      <td className="lp-muted" style={{ whiteSpace: 'nowrap' }}>
                        {timeAgo(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="lp-table-foot">
              <span className="lp-muted">
                {total === 0 ? 'No results' : `Showing ${from}–${to} of ${fmt(total)}`}
              </span>
              <div className="lp-flex" style={{ gap: 6 }}>
                <Btn
                  variant="ghost" size="sm" icon="chevron"
                  style={{ transform: 'scaleX(-1)' }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                />
                <span style={{ fontSize: 12, color: 'var(--lp-fg-muted)', padding: '0 4px', alignSelf: 'center' }}>
                  {page} / {totalPages || 1}
                </span>
                <Btn
                  variant="ghost" size="sm" iconRight="chevron"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                />
              </div>
            </div>
          </Card>
        </>
      ) : (
        /* ── Private feedback tab ── */
        <div className="lp-stack">
          <div style={{
            background: 'var(--lp-warning-bg, #fefce8)', border: '1px solid var(--lp-warning-border, #fde047)',
            borderRadius: 10, padding: '10px 14px', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="flag" size={14} />
            <span>
              These customers chose not to post publicly. Their feedback is private and only visible to you.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--lp-fg-muted)' }}>
              {pvLoading ? 'Loading…' : `${privateTotal} private response${privateTotal !== 1 ? 's' : ''}`}
            </span>
            <Select
              value={pvDays}
              onChange={v => { setPvDays(v); setPvPage(1); }}
              options={[
                { value: '7',  label: 'Last 7 days'  },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
                { value: 'all',label: 'All time'     },
              ]}
            />
          </div>

          {pvLoading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
              Loading feedback…
            </div>
          ) : privateItems.length === 0 ? (
            <Card>
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--lp-fg-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>No private feedback yet</div>
                <div style={{ fontSize: 12 }}>When customers submit low ratings privately, their feedback appears here.</div>
              </div>
            </Card>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {privateItems.map(r => <PrivateFeedbackCard key={r.id} r={r} />)}
              </div>

              {pvTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
                  <Btn
                    variant="ghost" size="sm" icon="chevron"
                    style={{ transform: 'scaleX(-1)' }}
                    onClick={() => setPvPage(p => Math.max(1, p - 1))}
                  />
                  <span style={{ fontSize: 12, color: 'var(--lp-fg-muted)', alignSelf: 'center' }}>
                    {pvPage} / {pvTotalPages}
                  </span>
                  <Btn
                    variant="ghost" size="sm" iconRight="chevron"
                    onClick={() => setPvPage(p => Math.min(pvTotalPages, p + 1))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
