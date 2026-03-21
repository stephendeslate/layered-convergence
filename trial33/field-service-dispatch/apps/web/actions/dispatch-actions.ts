'use server';

import type { PaginatedResult, WorkOrder } from '@field-service-dispatch/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// TRACED: FD-SEC-INPUT-001 — Server action with 'use server' + response.ok
export async function fetchWorkOrders(token: string, page = 1): Promise<PaginatedResult<WorkOrder>> {
  const response = await fetch(`${API_URL}/work-orders?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch work orders: ${response.status}`);
  }

  return response.json();
}

export async function transitionWorkOrder(token: string, id: string, status: string) {
  const response = await fetch(`${API_URL}/work-orders/${id}/transition`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to transition work order: ${response.status}`);
  }

  return response.json();
}
