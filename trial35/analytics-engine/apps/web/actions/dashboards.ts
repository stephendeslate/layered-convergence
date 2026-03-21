// TRACED: AE-ACTION-001 — Dashboard server actions
'use server';

import { type PaginatedResult, type Dashboard } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function getDashboards(token: string, page = 1): Promise<PaginatedResult<Dashboard>> {
  const response = await fetch(`${API_URL}/dashboards?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.status}`);
  }

  return response.json();
}

export async function createDashboard(token: string, name: string, description?: string) {
  const response = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create dashboard: ${response.status}`);
  }

  return response.json();
}
