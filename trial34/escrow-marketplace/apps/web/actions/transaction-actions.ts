'use server';

// TRACED: EM-FC-ACTION-002 — Transaction server action with response.ok check
export async function fetchTransactions() {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/transactions`, { cache: 'no-store' });
  if (!res.ok) { throw new Error('Failed to fetch transactions'); }
  return res.json();
}

export async function updateTransactionStatus(id: string, status: string) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/transactions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) { throw new Error('Failed to update transaction status'); }
  return res.json();
}
