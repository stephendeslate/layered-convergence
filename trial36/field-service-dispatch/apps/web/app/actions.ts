// TRACED: FD-ACTION-001 — Work order server actions
'use server';

import { type PaginatedResult, type WorkOrder, type Technician } from '@field-service-dispatch/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getWorkOrders(token: string, page = 1): Promise<PaginatedResult<WorkOrder>> {
  const response = await fetch(`${API_URL}/work-orders?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch work orders: ${response.status}`);
  }

  return response.json();
}

export async function createWorkOrder(token: string, title: string, priority: string) {
  const response = await fetch(`${API_URL}/work-orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, priority }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create work order: ${response.status}`);
  }

  return response.json();
}

export async function getTechnicians(token: string, page = 1): Promise<PaginatedResult<Technician>> {
  const response = await fetch(`${API_URL}/technicians?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch technicians: ${response.status}`);
  }

  return response.json();
}

export async function updateTechnicianStatus(token: string, id: string, status: string) {
  const response = await fetch(`${API_URL}/technicians/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update technician status: ${response.status}`);
  }

  return response.json();
}
