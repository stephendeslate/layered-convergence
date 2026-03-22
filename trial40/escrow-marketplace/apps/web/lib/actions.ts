// TRACED: EM-FE-011 — Server Actions with 'use server' and response.ok
'use server';

const API_BASE = process.env.API_URL || 'http://localhost:3001';

export async function fetchListings(): Promise<Array<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/listings?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

export async function fetchTransactions(): Promise<Array<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/transactions?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

export async function fetchEscrows(): Promise<Array<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/escrows?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data || [];
}

export async function fetchDisputes(): Promise<Array<Record<string, unknown>>> {
  const response = await fetch(`${API_BASE}/disputes?tenantId=default`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.data || [];
}
