// TRACED:EM-UI-03 Server Actions with response.ok checking
'use server';

import { normalizePageParams } from '@em/shared';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function getListings(tenantId: string, page?: number, pageSize?: number) {
  const params = normalizePageParams(page, pageSize);
  const response = await fetch(
    `${API_URL}/listings?tenantId=${tenantId}&page=${params.page}&pageSize=${params.pageSize}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  return response.json();
}

export async function getTransactions(tenantId: string) {
  const response = await fetch(
    `${API_URL}/transactions?tenantId=${tenantId}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
}

export async function getEscrows(tenantId: string) {
  const response = await fetch(
    `${API_URL}/escrows?tenantId=${tenantId}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch escrows');
  }

  return response.json();
}

export async function getDisputes(tenantId: string) {
  const response = await fetch(
    `${API_URL}/disputes?tenantId=${tenantId}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch disputes');
  }

  return response.json();
}
