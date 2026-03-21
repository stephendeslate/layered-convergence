'use server';

import type { PaginatedResult, EscrowTransaction } from '@escrow-marketplace/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// TRACED: EM-SEC-INPUT-001 — Server action with 'use server' + response.ok
export async function fetchTransactions(token: string, page = 1): Promise<PaginatedResult<EscrowTransaction>> {
  const response = await fetch(`${API_URL}/escrow?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

export async function transitionEscrow(token: string, id: string, status: string) {
  const response = await fetch(`${API_URL}/escrow/${id}/transition`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to transition escrow: ${response.status}`);
  }

  return response.json();
}
