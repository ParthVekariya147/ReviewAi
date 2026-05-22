import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Reevo — AI-powered Google review funnel for local businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F0F12 0%, #1A1A2E 60%, #16162A 100%)',
          padding: '80px 100px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6E5BFF, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            R
          </div>
          <span style={{ color: 'white', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>Reevo</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'white',
            maxWidth: 820,
            marginBottom: 28,
          }}
        >
          Turn visits into
          <span style={{ background: 'linear-gradient(90deg, #6E5BFF, #8B5CF6)', WebkitBackgroundClip: 'text', color: 'transparent' }}> 5-star reviews</span>
        </div>

        {/* Subtext */}
        <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)', fontWeight: 400, maxWidth: 700, lineHeight: 1.4 }}>
          AI-powered QR funnels that convert happy customers into authentic Google reviews — in under 60 seconds.
        </div>

        {/* Decorative star row */}
        <div style={{ display: 'flex', gap: 8, marginTop: 48 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ color: '#FBBF24', fontSize: 36 }}>★</div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
