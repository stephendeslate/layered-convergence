'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiFetch, getStoredToken, getStoredUser, clearStoredAuth } from '../../lib/api';
import TransactionTimeline from '../../components/TransactionTimeline';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  provider: { id: string; name: string; email: string };
  stateHistory?: Array<{
    id: string;
    fromState: string;
    toState: string;
    reason: string | null;
    performedBy: string | null;
    createdAt: string;
  }>;
  disputes?: Array<{ id: string; status: string; reason: string }>;
}

const statusColors: Record<string, string> = {
  CREATED: '#6b7280',
  HELD: '#3b82f6',
  RELEASED: '#10b981',
  DISPUTED: '#ef4444',
  REFUNDED: '#f59e0b',
  EXPIRED: '#9ca3af',
};

export default function BuyerPortal() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [providerId, setProviderId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [disputeReason, setDisputeReason] = useState('SERVICE_NOT_DELIVERED');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [showDispute, setShowDispute] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    if (!user || user.role !== 'BUYER') {
      window.location.href = '/login';
      return;
    }
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      const token = getStoredToken();
      const res = await apiFetch<{ data: Transaction[] }>('/transactions', { token: token ?? undefined });
      setTransactions(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactionDetail(id: string) {
    const token = getStoredToken();
    const tx = await apiFetch<Transaction>(`/transactions/${id}`, { token: token ?? undefined });
    setSelectedTx(tx);
  }

  async function handleCreatePayment(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const token = getStoredToken();
      await apiFetch('/transactions', {
        method: 'POST',
        token: token ?? undefined,
        body: { providerId, amount: parseInt(amount, 10), description },
      });
      setShowCreate(false);
      setProviderId('');
      setAmount('');
      setDescription('');
      await loadTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    }
  }

  async function handleRelease(txId: string) {
    try {
      const token = getStoredToken();
      await apiFetch(`/transactions/${txId}/release`, { method: 'POST', token: token ?? undefined });
      await loadTransactions();
      if (selectedTx?.id === txId) await loadTransactionDetail(txId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release');
    }
  }

  async function handleRaiseDispute(e: FormEvent) {
    e.preventDefault();
    if (!selectedTx) return;
    try {
      const token = getStoredToken();
      await apiFetch('/disputes', {
        method: 'POST',
        token: token ?? undefined,
        body: { transactionId: selectedTx.id, reason: disputeReason, description: disputeDesc },
      });
      setShowDispute(false);
      setDisputeDesc('');
      await loadTransactions();
      await loadTransactionDetail(selectedTx.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to raise dispute');
    }
  }

  function handleLogout() {
    clearStoredAuth();
    window.location.href = '/login';
  }

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' as const };

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Buyer Portal</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>{user?.name}</span>
          <button onClick={() => setShowCreate(true)} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
            New Payment
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1rem', fontSize: '14px' }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: '8px', cursor: 'pointer', border: 'none', background: 'none', color: '#dc2626' }}>x</button>
        </div>
      )}

      {showCreate && (
        <div style={{ padding: '1rem', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#f9fafb' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Create Payment</h2>
          <form onSubmit={handleCreatePayment}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Provider ID</label>
              <input type="text" value={providerId} onChange={(e) => setProviderId(e.target.value)} required style={inputStyle} placeholder="UUID of the provider" />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Amount (cents)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min={100} style={inputStyle} placeholder="1000 = $10.00" />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Description</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required minLength={3} style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Create</button>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedTx ? '1fr 1fr' : '1fr', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Transactions</h2>
          {loading ? (
            <p style={{ color: '#6b7280' }}>Loading...</p>
          ) : transactions.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No transactions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transactions.map((tx) => (
                <div key={tx.id} onClick={() => loadTransactionDetail(tx.id)}
                  style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedTx?.id === tx.id ? '#eff6ff' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>${(tx.amount / 100).toFixed(2)}</span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: statusColors[tx.status] ?? '#6b7280', color: 'white' }}>
                      {tx.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{tx.description}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    Provider: {tx.provider.name} | {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTx && (
          <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Transaction Detail</h2>
            <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>ID:</strong> {selectedTx.id}</div>
              <div><strong>Amount:</strong> ${(selectedTx.amount / 100).toFixed(2)}</div>
              <div><strong>Status:</strong> <span style={{ color: statusColors[selectedTx.status] }}>{selectedTx.status}</span></div>
              <div><strong>Description:</strong> {selectedTx.description}</div>
              <div><strong>Provider:</strong> {selectedTx.provider?.name}</div>
            </div>

            {selectedTx.status === 'HELD' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
                <button onClick={() => handleRelease(selectedTx.id)} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  Confirm Delivery
                </button>
                <button onClick={() => setShowDispute(true)} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
                  Raise Dispute
                </button>
              </div>
            )}

            {showDispute && (
              <form onSubmit={handleRaiseDispute} style={{ marginTop: '1rem', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Reason</label>
                  <select value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} style={{ ...inputStyle }}>
                    <option value="SERVICE_NOT_DELIVERED">Service Not Delivered</option>
                    <option value="SERVICE_NOT_AS_DESCRIBED">Service Not As Described</option>
                    <option value="UNAUTHORIZED_CHARGE">Unauthorized Charge</option>
                    <option value="DUPLICATE_CHARGE">Duplicate Charge</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Description</label>
                  <textarea value={disputeDesc} onChange={(e) => setDisputeDesc(e.target.value)} required minLength={10} rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Submit Dispute</button>
                  <button type="button" onClick={() => setShowDispute(false)} style={{ padding: '8px 16px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            )}

            {selectedTx.stateHistory && selectedTx.stateHistory.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '0.75rem' }}>Timeline</h3>
                <TransactionTimeline history={selectedTx.stateHistory} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
