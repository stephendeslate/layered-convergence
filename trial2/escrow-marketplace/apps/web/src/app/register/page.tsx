'use client';

import { useState, FormEvent } from 'react';
import { apiFetch, setStoredAuth } from '../../lib/api';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'BUYER' | 'PROVIDER'>('BUYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch<{
        id: string;
        email: string;
        name: string;
        role: string;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', {
        method: 'POST',
        body: { email, password, name, role },
      });

      setStoredAuth(res.accessToken, res.refreshToken, {
        id: res.id,
        email: res.email,
        name: res.name,
        role: res.role,
      });

      const redirectMap: Record<string, string> = {
        BUYER: '/buyer',
        PROVIDER: '/provider',
      };
      window.location.href = redirectMap[res.role] ?? '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' as const };

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create Account</h1>
      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2}
            style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            style={inputStyle} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>I am a</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setRole('BUYER')}
              style={{ flex: 1, padding: '10px', border: '2px solid', borderColor: role === 'BUYER' ? '#3b82f6' : '#d1d5db', borderRadius: '6px', backgroundColor: role === 'BUYER' ? '#eff6ff' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              Buyer
            </button>
            <button type="button" onClick={() => setRole('PROVIDER')}
              style={{ flex: 1, padding: '10px', border: '2px solid', borderColor: role === 'PROVIDER' ? '#3b82f6' : '#d1d5db', borderRadius: '6px', backgroundColor: role === 'PROVIDER' ? '#eff6ff' : 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
              Provider
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
        Already have an account? <a href="/login" style={{ color: '#3b82f6' }}>Sign in</a>
      </p>
    </main>
  );
}
