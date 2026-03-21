'use client';

import { useState, useEffect } from 'react';
import { apiFetch, getStoredToken, getStoredUser, clearStoredAuth } from '../../lib/api';

interface Analytics {
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  disputeRate: number;
  transactionsByStatus: Array<{ status: string; count: number }>;
}

interface VolumeData {
  data: Array<{ date: string; count: number; volume: number; fees: number }>;
}

interface Dispute {
  id: string;
  status: string;
  reason: string;
  description: string;
  createdAt: string;
  transaction: {
    id: string;
    amount: number;
    buyer: { name: string };
    provider: { name: string };
  };
  raisedBy: { name: string };
}

const statusColors: Record<string, string> = {
  CREATED: '#6b7280', HELD: '#3b82f6', RELEASED: '#10b981', DISPUTED: '#ef4444', REFUNDED: '#f59e0b', EXPIRED: '#9ca3af',
  OPEN: '#ef4444', EVIDENCE_SUBMITTED: '#f59e0b', UNDER_REVIEW: '#3b82f6', RESOLVED_BUYER: '#10b981', RESOLVED_PROVIDER: '#10b981', CLOSED: '#9ca3af',
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [volume, setVolume] = useState<VolumeData | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [tab, setTab] = useState<'overview' | 'disputes'>('overview');
  const [error, setError] = useState('');
  const user = getStoredUser();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      window.location.href = '/login';
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    const token = getStoredToken();
    try {
      const [analyticsRes, volumeRes, disputesRes] = await Promise.all([
        apiFetch<Analytics>('/analytics/overview', { token: token ?? undefined }),
        apiFetch<VolumeData>('/analytics/volume', { token: token ?? undefined }),
        apiFetch<{ data: Dispute[] }>('/disputes', { token: token ?? undefined }),
      ]);
      setAnalytics(analyticsRes);
      setVolume(volumeRes);
      setDisputes(disputesRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  }

  async function resolveDispute(disputeId: string, resolution: 'BUYER' | 'PROVIDER') {
    const token = getStoredToken();
    try {
      await apiFetch(`/disputes/${disputeId}/resolve`, {
        method: 'POST',
        token: token ?? undefined,
        body: { resolution, notes: `Resolved in ${resolution.toLowerCase()}'s favor by admin` },
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
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

  const cardStyle = {
    padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb',
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>
      )}

      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        <button onClick={() => setTab('overview')} style={tabStyle(tab === 'overview')}>Analytics</button>
        <button onClick={() => setTab('disputes')} style={tabStyle(tab === 'disputes')}>Dispute Queue ({disputes.filter(d => ['OPEN', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW'].includes(d.status)).length})</button>
      </div>

      {tab === 'overview' && analytics && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Transactions</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.totalTransactions}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Volume</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${(analytics.totalVolume / 100).toFixed(2)}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Fee Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${(analytics.totalFees / 100).toFixed(2)}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>Dispute Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.disputeRate}%</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Transactions by Status</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {analytics.transactionsByStatus.map((s) => (
                <div key={s.status} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: statusColors[s.status] ?? '#6b7280', color: 'white', fontSize: '14px' }}>
                  {s.status}: {s.count}
                </div>
              ))}
            </div>
          </div>

          {volume && volume.data.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Daily Volume (Last 30 Days)</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                {volume.data.map((d) => {
                  const maxVol = Math.max(...volume.data.map((v) => v.volume));
                  const height = maxVol > 0 ? (d.volume / maxVol) * 100 : 0;
                  return (
                    <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }} title={`${d.date}: $${(d.volume / 100).toFixed(2)} (${d.count} txns)`}>
                      <div style={{ width: '100%', height: `${height}%`, backgroundColor: '#3b82f6', borderRadius: '2px 2px 0 0', minHeight: '2px' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'disputes' && (
        <div>
          {disputes.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No disputes.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {disputes.map((d) => (
                <div key={d.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>
                      ${(d.transaction.amount / 100).toFixed(2)} - {d.reason.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: statusColors[d.status] ?? '#6b7280', color: 'white' }}>{d.status}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{d.description}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    Buyer: {d.transaction.buyer.name} | Provider: {d.transaction.provider.name} | Raised by: {d.raisedBy.name} | {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                  {['OPEN', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW'].includes(d.status) && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => resolveDispute(d.id, 'BUYER')} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                        Resolve for Buyer (Refund)
                      </button>
                      <button onClick={() => resolveDispute(d.id, 'PROVIDER')} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                        Resolve for Provider (Release)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
