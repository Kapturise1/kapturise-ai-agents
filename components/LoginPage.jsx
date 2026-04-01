'use client';
import { useState } from 'react';

const BRAND = { bg: '#060610', card: '#0d0d1a', border: '#1a1a2e', accent: '#6c63ff', accentHover: '#7b73ff', text: '#e0e0e0', muted: '#9e9ebb', error: '#ff6b6b', success: '#51cf66' };

export default function LoginPage({ supabase, onAuth }) {
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      if (data?.session) onAuth(data.session);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    try {
      const { data, error: err } = await supabase.auth.signUp({ email, password });
      if (err) throw err;
      if (data?.session) { onAuth(data.session); }
      else { setMessage('Check your email for a confirmation link. You can then sign in.'); setMode('login'); }
    } catch (err) {
      setError(err.message || 'Signup failed');
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (err) throw err;
      setMessage('Password reset link sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    }
    setLoading(false);
  };

  const S = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.bg, fontFamily: 'Sora, sans-serif', padding: 20 },
    container: { width: '100%', maxWidth: 420, background: BRAND.card, borderRadius: 16, border: `1px solid ${BRAND.border}`, padding: '40px 32px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
    logo: { textAlign: 'center', marginBottom: 32 },
    logoText: { fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' },
    logoAccent: { color: BRAND.accent },
    subtitle: { color: BRAND.muted, fontSize: 13, marginTop: 8, lineHeight: 1.5 },
    form: { display: 'flex', flexDirection: 'column', gap: 16 },
    label: { fontSize: 12, fontWeight: 500, color: BRAND.muted, marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '12px 14px', background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'Sora, sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    btn: { width: '100%', padding: '13px 0', background: BRAND.accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora, sans-serif', transition: 'background 0.2s', marginTop: 8, opacity: loading ? 0.7 : 1 },
    toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: BRAND.muted },
    link: { color: BRAND.accent, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Sora, sans-serif', fontSize: 13, textDecoration: 'underline', padding: 0 },
    error: { background: 'rgba(255,107,107,0.1)', border: `1px solid ${BRAND.error}`, borderRadius: 8, padding: '10px 14px', color: BRAND.error, fontSize: 13, textAlign: 'center' },
    success: { background: 'rgba(81,207,102,0.1)', border: `1px solid ${BRAND.success}`, borderRadius: 8, padding: '10px 14px', color: BRAND.success, fontSize: 13, textAlign: 'center' },
    divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0', color: BRAND.muted, fontSize: 12 },
    line: { flex: 1, height: 1, background: BRAND.border },
    agents: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24, flexWrap: 'wrap' },
    agentDot: (i) => ({ width: 8, height: 8, borderRadius: '50%', background: `hsl(${i * 21}, 70%, 60%)`, opacity: 0.6 }),
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.logo}>
          <div style={S.logoText}>
            <span style={S.logoAccent}>K</span>apturise
          </div>
          <div style={S.subtitle}>
            {mode === 'login' ? 'Sign in to your AI Agents dashboard' :
             mode === 'signup' ? 'Create your account to get started' :
             'Reset your password'}
          </div>
          <div style={S.agents}>
            {Array.from({length: 17}, (_, i) => (
              <div key={i} style={S.agentDot(i)} title={`Agent ${i + 1}`} />
            ))}
          </div>
        </div>

        {error && <div style={S.error}>{error}</div>}
        {message && <div style={S.success}>{message}</div>}

        {mode === 'login' && (
          <form style={S.form} onSubmit={handleLogin}>
            <div>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus onFocus={e => e.target.style.borderColor = BRAND.accent} onBlur={e => e.target.style.borderColor = BRAND.border} />
            </div>
            <div>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} onFocus={e => e.target.style.borderColor = BRAND.accent} onBlur={e => e.target.style.borderColor = BRAND.border} />
            </div>
            <button style={S.btn} type="submit" disabled={loading} onMouseOver={e => !loading && (e.target.style.background = BRAND.accentHover)} onMouseOut={e => e.target.style.background = BRAND.accent}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button type="button" style={S.link} onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}>Forgot password?</button>
            </div>
            <div style={S.divider}><div style={S.line} /><span>or</span><div style={S.line} /></div>
            <div style={S.toggle}>
              Don&apos;t have an account?{' '}
              <button type="button" style={S.link} onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>Sign up</button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form style={S.form} onSubmit={handleSignup}>
            <div>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus onFocus={e => e.target.style.borderColor = BRAND.accent} onBlur={e => e.target.style.borderColor = BRAND.border} />
            </div>
            <div>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} onFocus={e => e.target.style.borderColor = BRAND.accent} onBlur={e => e.target.style.borderColor = BRAND.border} />
            </div>
            <div>
              <label style={S.label}>Confirm Password</label>
              <input style={S.input} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} onFocus={e => e.target.style.borderColor = BRAND.accent} onBlur={e => e.target.style.borderColor = BRAND.border} />
            </div>
            <button style={S.btn} type="submit" disabled={loading} onMouseOver={e => !loading && (e.target.style.background = BRAND.accentHover)} onMouseOut={e => e.target.style.background = BRAND.accent}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <div style={S.divider}><div style={S.line} /><span>or</span><div style={S.line} /></div>
            <div style={S.toggle}>
              Already have an account?{' '}
              <button type="button" style={S.link} onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign in</button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form style={S.form} onSubmit={handleForgot}>
            <div>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus onFocus={e => e.target.style.borderColor = BRAND.accent} onBlur={e => e.target.style.borderColor = BRAND.border} />
            </div>
            <button style={S.btn} type="submit" disabled={loading} onMouseOver={e => !loading && (e.target.style.background = BRAND.accentHover)} onMouseOut={e => e.target.style.background = BRAND.accent}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div style={S.toggle}>
              <button type="button" style={S.link} onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Back to sign in</button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: BRAND.muted, opacity: 0.5 }}>
          Kapturise AI Agents Platform &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
