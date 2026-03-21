'use client';

import { useState, useEffect } from 'react';
import { apiFetch, getStoredToken, getStoredUser, clearStoredAuth } from '../../lib/api';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  buyer: { name: string; email: string };
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  transaction: { description: string };
}

interface OnboardingStatus {
  onboardingStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  accountId?: string;
}

const statusColors: Record<string, string> = {
  CREATED: '#6b7280', HELD: '#3b82f6', RELEASED: '#10b981', DISPUTED: '#ef4444', REFUNDED: '#f59e0b', EXPIRED: '#9ca3af',
  PENDING: '#f59e0b', PROCESSING: '#3b82f6', COMPLETED: '#10b981', FAILED: '#ef4444',
};

export default function ProviderPortal() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [tab, setTab] = useState<'payments' | 'payouts' | 'onboarding'>('payments');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    if (!user || user.role !== 'PROVIDER') {
      window.location.href = '/login';
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    const token = getStoredToken();
    try {
      const [txRes, payoutRes] = await Promise.all([
        apiFetch<{ data: Transaction[] }>('/transactions', { token: token ?? undefined }),
        apiFetch<{ data: Payout[] }>('/payouts', { token: token ?? undefined }),
      ]);
      setTransactions(txRes.data);
      setPayouts(payoutRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function checkOnboarding() {
    const token = getStoredToken();
    try {
      const res = await apiFetch<OnboardingStatus>('/stripe/connect/status', { token: token ?? undefined });
      setOnboarding(res);
    } catch {
      setOnboarding({ onboardingStatus: 'NOT_STARTED', chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false });
    }
  }

  async function startOnboarding() {
    const token = getStoredToken();
    try {
      const res = await apiFetch<{ url: string }>('/stripe/connect/onboard', { method: 'POST', token: token ?? undefined });
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start onboarding');
    }
  }

  function handleLogout() {
    clearStoredAuth();
    window.location.href = '/login';
  }

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px', border: 'none', borderBottom: `2px solid ${active ? '#3b82f6' : 'transparent'}`,
    backgroundColor: 'transparent', color: active ? '#3b82f6' : '#6b7280', fontWeight: active ? 600 : 400 as const,
    fontSize: '14px', cursor: 'pointer' as const,
  });

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Provider Portal</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        <button onClick={() => setTab('payments')} style={tabStyle(tab === 'payments')}>Incoming Payments</button>
        <button onClick={() => setTab('payouts')} style={tabStyle(tab === 'payouts')}>Payout History</button>
        <button onClick={() => { setTab('onboarding'); checkOnboarding(); }} style={tabStyle(tab === 'onboarding')}>Stripe Connect</button>
      </div>

      {tab === 'payments' && (
        <div>
          {loading ? <p style={{ color: '#6b7280' }}>Loading...</p> : transactions.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No incoming payments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transactions.map((tx) => (
                <div key={tx.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>${(tx.amount / 100).toFixed(2)}</span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: statusColors[tx.status] ?? '#6b7280', color: 'white' }}>{tx.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{tx.description}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>From: {tx.buyer.name} | {new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'payouts' && (
        <div>
          {payouts.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No payouts yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {payouts.map((p) => (
                <div key={p.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>${(p.amount / 100).toFixed(2)}</span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: statusColors[p.status] ?? '#6b7280', color: 'white' }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{p.transaction.description}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{new Date(p.createdAt).toLocaleDateString()}{p.completedAt && ` | Completed: ${new Date(p.completedAt).toLocaleDateString()}`}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'onboarding' && (
        <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Stripe Connect Setup</h2>
          {onboarding ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Status</div>
                  <div style={{ fontWeight: 600, color: onboarding.onboardingStatus === 'ACTIVE' ? '#10b981' : '#f59e0b' }}>{onboarding.onboardingStatus}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Charges</div>
                  <div style={{ fontWeight: 600 }}>{onboarding.chargesEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Payouts</div>
                  <div style={{ fontWeight: 600 }}>{onboarding.payoutsEnabled ? 'Enabled' : 'Disabled'}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Details Submitted</div>
                  <div style={{ fontWeight: 600 }}>{onboarding.detailsSubmitted ? 'Yes' : 'No'}</div>
                </div>
              </div>
              {onboarding.onboardingStatus !== 'ACTIVE' && (
                <button onClick={startOnboarding} style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  {onboarding.onboardingStatus === 'NOT_STARTED' ? 'Start Onboarding' : 'Continue Onboarding'}
                </button>
              )}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>Loading onboarding status...</p>
          )}
        </div>
      )}
    </main>
  );
}
