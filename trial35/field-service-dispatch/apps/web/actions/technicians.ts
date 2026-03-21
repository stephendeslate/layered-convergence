// TRACED: FD-ACTION-002 — Technician server actions
'use server';

import { type PaginatedResult, type Technician } from '@field-service-dispatch/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

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
