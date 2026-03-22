'use server';

// TRACED: EM-FE-001 — Server Actions with 'use server' directive
// TRACED: EM-FE-002 — response.ok check on all fetches

import { truncateText, slugify } from '@escrow-marketplace/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchListings(page: number = 1, pageSize: number = 20) {
  const response = await fetch(
    `${API_URL}/listings?page=${page}&pageSize=${pageSize}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.status}`);
  }

  return response.json();
}

export async function fetchTransactions(
  token: string,
  page: number = 1,
  pageSize: number = 20,
) {
  const response = await fetch(
    `${API_URL}/transactions?page=${page}&pageSize=${pageSize}`,
    {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

export async function fetchEscrowDetails(token: string) {
  const response = await fetch(`${API_URL}/transactions?page=1&pageSize=50`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch escrow details: ${response.status}`);
  }

  return response.json();
}

export async function loginAction(
  email: string,
  password: string,
  tenantId: string,
) {
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

export async function registerAction(
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

export async function formatListingPreview(title: string, description: string) {
  return {
    slug: slugify(title),
    preview: truncateText(description, 80),
  };
}
