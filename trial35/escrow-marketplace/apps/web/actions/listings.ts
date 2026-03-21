// TRACED: EM-ACTION-001 — Listing server actions
'use server';

import { type PaginatedResult, type Listing } from '@escrow-marketplace/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getListings(token: string, page = 1): Promise<PaginatedResult<Listing>> {
  const response = await fetch(`${API_URL}/listings?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.status}`);
  }

  return response.json();
}

export async function createListing(token: string, title: string, description: string, price: string) {
  const response = await fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description, price }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create listing: ${response.status}`);
  }

  return response.json();
}
