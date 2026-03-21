'use server';

import type { PaginatedResult, DashboardWidget } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

// TRACED: AE-SEC-INPUT-001 — Server action with 'use server' + response.ok
export async function fetchDashboards(token: string, page = 1): Promise<PaginatedResult<DashboardWidget>> {
  const response = await fetch(`${API_URL}/dashboards?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.status}`);
  }

  return response.json();
}

export async function createDashboard(token: string, name: string) {
  const response = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create dashboard: ${response.status}`);
  }

  return response.json();
}
