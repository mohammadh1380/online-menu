'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      localStorage.setItem('admin_token', res.data.access_token);
      router.push('/admin');
    } catch {
      setError('نام کاربری یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color .2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Card */}
        <div style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '40px 36px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <span style={{ fontSize: 34 }}>☕</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>ورود مدیریت</h1>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)' }}>پنل مدیریت کافه</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                نام کاربری
              </label>
              <input
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle} placeholder="admin"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
                رمز عبور
              </label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle} placeholder="••••••••"
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {error && (
              <p style={{
                color: '#f87171', fontSize: '0.82rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, padding: '9px 14px', textAlign: 'center',
              }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12,
                fontWeight: 700, fontSize: '0.95rem',
                background: loading ? 'rgba(255,255,255,0.3)' : '#ffffff',
                color: '#111111', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4, transition: 'opacity .2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading ? 'در حال ورود…' : 'ورود'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <a
              href="/"
              style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              بازگشت به منو
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
