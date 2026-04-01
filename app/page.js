'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports (no SSR)
const KapturiseApp = dynamic(() => import('../components/KapturiseApp'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#060610', color: '#9e9ebb',
      fontFamily: 'Sora, sans-serif', fontSize: 14
    }}>
      Loading Kapturise AI Agents...
    </div>
  )
});

const LoginPage = dynamic(() => import('../components/LoginPage'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#060610', color: '#9e9ebb',
      fontFamily: 'Sora, sans-serif', fontSize: 14
    }}>
      Loading...
    </div>
  )
});

export default function Page() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState(null);

  useEffect(() => {
    let sub;
    (async () => {
      try {
        const { supabase, storage } = await import('../lib/supabase');
        // Polyfill window.storage
        if (typeof window !== 'undefined') window.storage = storage;

        if (!supabase) {
          // No Supabase configured — skip auth, show app directly
          setChecking(false);
          setSession({ skipAuth: true });
          return;
        }

        setSupabaseClient(supabase);

        // Check current session
        const { data: { session: s } } = await supabase.auth.getSession();
        setSession(s);
        setChecking(false);

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
          setSession(s);
        });
        sub = subscription;
      } catch (err) {
        console.error('Auth init error:', err);
        // Fallback — show app without auth
        if (typeof window !== 'undefined') {
          window.storage = {
            async get(key) { try { const v = localStorage.getItem(`kap_${key}`); return v ? { key, value: v } : null; } catch { return null; } },
            async set(key, value) { try { localStorage.setItem(`kap_${key}`, value); return { key, value }; } catch { return null; } },
            async delete(key) { try { localStorage.removeItem(`kap_${key}`); return { key, deleted: true }; } catch { return null; } },
            async list(prefix) { try { const keys = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith(`kap_${prefix || ''}`)) keys.push(k.replace('kap_', '')); } return { keys }; } catch { return { keys: [] }; } }
          };
        }
        setSession({ skipAuth: true });
        setChecking(false);
      }
    })();
    return () => { if (sub) sub.unsubscribe(); };
  }, []);

  const handleSignOut = async () => {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
      setSession(null);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#060610', color: '#9e9ebb',
        fontFamily: 'Sora, sans-serif', fontSize: 14
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
            <span style={{ color: '#6c63ff' }}>K</span>apturise
          </div>
          <div>Initializing...</div>
        </div>
      </div>
    );
  }

  // Not logged in — show login page
  if (!session) {
    return <LoginPage supabase={supabaseClient} onAuth={(s) => setSession(s)} />;
  }

  // Logged in — show the app with a sign-out option
  return <KapturiseApp onSignOut={handleSignOut} userEmail={session?.user?.email || ''} />;
}
