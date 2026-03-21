// TRACED: EM-ACTION-002 — Transaction server actions
'use server';

import { type PaginatedResult, type Transaction } from '@escrow-marketplace/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getTransactions(token: string, page = 1): Promise<PaginatedResult<Transaction>> {
  const response = await fetch(`${API_URL}/transactions?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

export async function updateTransactionStatus(token: string, id: string, status: string) {
  const response = await fetch(`${API_URL}/transactions/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update transaction status: ${response.status}`);
  }

  return response.json();
}
