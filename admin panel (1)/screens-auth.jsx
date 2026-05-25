// screens-auth.jsx — Login + 404

const LoginScreen = () => {
  const [email, setEmail] = React.useState('priya@reevo.io');
  const [password, setPassword] = React.useState('•••••••••••••');
  const [show2fa, setShow2fa] = React.useState(false);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'grid', gridTemplateColumns: '1fr 1.05fr',
      background: 'var(--bg)', color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
    }}>
      {/* Left — form panel */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        padding: '40px 56px',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ReevoMark size={32}/>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Reevo</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Admin Console</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 380, alignSelf: 'center', width: '100%' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px',
            background: 'var(--accent-soft)', color: 'var(--accent-ink)',
            borderRadius: 999, fontSize: 11, fontWeight: 600,
            marginBottom: 16, alignSelf: 'flex-start',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            <Ico.Lock size={11}/>
            Internal access only
          </div>

          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Sign in to the<br/>
            <span style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Admin Console</span>
          </h1>
          <p style={{ marginTop: 12, marginBottom: 28, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
            Manage businesses, subscriptions, abuse signals, and platform health for Reevo's AI review generator.
          </p>

          <form onSubmit={e => { e.preventDefault(); setShow2fa(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--ink-2)' }}>Work email</label>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0 12px', height: 42,
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
              }}>
                <Ico.Mail/>
                <input value={email} onChange={e => setEmail(e.target.value)}
                  style={{ border: 0, outline: 0, flex: 1, fontSize: 14, background: 'transparent', color: 'var(--ink)' }}/>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }}>Password</label>
                <a href="#" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0 12px', height: 42,
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
              }}>
                <Ico.Lock/>
                <input value={password} onChange={e => setPassword(e.target.value)} type="password"
                  style={{ border: 0, outline: 0, flex: 1, fontSize: 14, background: 'transparent', color: 'var(--ink)', letterSpacing: '0.1em' }}/>
              </div>
            </div>

            {show2fa && (
              <div style={{
                padding: '14px 16px', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-soft)', border: '1px solid var(--accent)',
              }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--accent-ink)' }}>Two-factor code · sent to authenticator</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[2,9,4,8,1,7].map((v, i) => (
                    <input key={i} defaultValue={v}
                      style={{
                        width: 38, height: 44, fontSize: 18, fontWeight: 700,
                        textAlign: 'center', border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-sm)', background: 'var(--surface)',
                        color: 'var(--ink)', outline: 'none',
                        fontFamily: 'var(--font-mono)',
                      }}/>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" style={{ marginTop: 4, width: '100%', justifyContent: 'center', height: 44, fontSize: 14 }}>
              {show2fa ? 'Verify & sign in' : 'Continue with email'}
            </Button>
          </form>

          <div style={{ marginTop: 24, fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ico.ShieldAlert size={14}/>
            Sessions expire after 30 min idle. All actions are logged.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
          <span>© Reevo 2025</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>v1.0.4 · internal</span>
        </div>
      </div>

      {/* Right — gradient marketing panel */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1B1A3C 0%, #07080F 100%)',
        color: '#fff',
        padding: '40px 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* Big gradient orb */}
        <div style={{
          position: 'absolute', top: '-25%', right: '-20%',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(110,91,255,0.65) 0%, rgba(47,125,251,0.15) 50%, transparent 75%)',
          filter: 'blur(2px)',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(47,125,251,0.45) 0%, transparent 70%)',
        }}/>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}/>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 0 4px rgba(52,211,153,0.2)' }}/>
          All systems operational · api.reevo.io
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Platform at a glance
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { v: '1,247',  l: 'Businesses' },
              { v: '$48.3K', l: 'MRR · Feb' },
              { v: '18,432', l: 'Scans today' },
              { v: '64.2%',  l: 'Avg copy rate' },
            ].map((s, i) => (
              <div key={i} style={{
                padding: 18, borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.v}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', fontSize: 13, color: 'rgba(255,255,255,0.55)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Reevo · The AI review platform for local businesses</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>SOC 2 Type II</span>
        </div>
      </div>
    </div>
  );
};

const NotFoundScreen = ({ onNavigate }) => (
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)', color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
    padding: 40, gap: 6, position: 'relative', overflow: 'hidden',
  }}>
    {/* Subtle gradient backdrop */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(ellipse at center, rgba(110,91,255,0.10) 0%, transparent 60%)',
    }}/>
    {/* 404 */}
    <div style={{
      position: 'relative', fontSize: 180, fontWeight: 800,
      lineHeight: 1, letterSpacing: '-0.06em',
      background: 'var(--accent-gradient)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>404</div>

    <div style={{ position: 'relative', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginTop: -8 }}>
      Page not found
    </div>
    <div style={{ position: 'relative', fontSize: 14, color: 'var(--muted)', maxWidth: 420, textAlign: 'center', lineHeight: 1.5 }}>
      The page you're looking for doesn't exist or has been moved. Check the URL or head back to the dashboard.
    </div>

    <div style={{ position: 'relative', display: 'flex', gap: 8, marginTop: 20 }}>
      <Button variant="ghost" icon={<Ico.ChevronLeft size={14}/>}>Go back</Button>
      <Button variant="primary" icon={<Ico.Dashboard/>} onClick={() => onNavigate && onNavigate('dashboard')}>Back to dashboard</Button>
    </div>

    <div style={{
      position: 'relative', marginTop: 36,
      padding: '8px 14px', borderRadius: 999,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
      fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ color: 'var(--danger)' }}>·</span>
      ERR_ROUTE_NOT_FOUND · req_a82h1c
    </div>
  </div>
);

Object.assign(window, { LoginScreen, NotFoundScreen });
