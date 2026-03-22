'use server';

// TRACED: EM-FE-010 — Server Actions with 'use server' and response.ok checks

const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function fetchListings(token: string, page: number = 1) {
  const response = await fetch(`${API_URL}/listings?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.status}`);
  }

  return response.json();
}

export async function fetchTransactions(token: string, page: number = 1) {
  const response = await fetch(`${API_URL}/transactions?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

export async function createTransaction(token: string, listingId: string) {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create transaction: ${response.status}`);
  }

  return response.json();
}

export async function loginUser(email: string, password: string, tenantId: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantId }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  return response.json();
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: string,
  tenantId: string,
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, tenantId }),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }

  return response.json();
}
