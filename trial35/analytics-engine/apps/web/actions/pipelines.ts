// TRACED: AE-ACTION-002 — Pipeline server actions
'use server';

import { type PaginatedResult, type Pipeline } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getPipelines(token: string, page = 1): Promise<PaginatedResult<Pipeline>> {
  const response = await fetch(`${API_URL}/pipelines?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pipelines: ${response.status}`);
  }

  return response.json();
}

export async function updatePipelineStatus(token: string, id: string, status: string) {
  const response = await fetch(`${API_URL}/pipelines/${id}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update pipeline status: ${response.status}`);
  }

  return response.json();
}
