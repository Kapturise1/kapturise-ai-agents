'use client';

if (typeof window !== 'undefined') {
  import('../lib/supabase').then(({ storage }) => {
    window.storage = storage;
  }).catch(() => {
    window.storage = {
      async get(key) { try { const v = localStorage.getItem(`kap_${key}`); return v ? { key, value: v } : null; } catch { return null; } },
      async set(key, value) { try { localStorage.setItem(`kap_${key}`, value); return { key, value }; } catch { return null; } },
      async delete(key) { try { localStorage.removeItem(`kap_${key}`); return { key, deleted: true }; } catch { return null; } },
      async list(prefix) { try { const keys = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith(`kap_${prefix || ''}`)) keys.push(k.replace('kap_', '')); } return { keys }; } catch { return { keys: [] }; } }
    };
  });
}

import dynamic from 'next/dynamic';
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

export default function Page() {
  return <KapturiseApp />;
}