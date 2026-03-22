// TRACED: EM-FE-013 — Server Actions with response.ok validation
'use server';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

export async function fetchListings() {
  const response = await fetch(`${API_BASE}/listings?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.status}`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function fetchTransactions() {
  const response = await fetch(`${API_BASE}/transactions?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function fetchEscrowAccounts() {
  const response = await fetch(`${API_BASE}/escrow?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch escrow accounts: ${response.status}`);
  }

  const result = await response.json();
  return result.data || [];
}
