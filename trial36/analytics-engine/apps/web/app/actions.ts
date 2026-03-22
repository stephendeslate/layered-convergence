'use server';

import { DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED: AE-FE-005
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchDashboards(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const response = await fetch(
    `${API_URL}/dashboards?page=${page}&pageSize=${pageSize}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.status}`);
  }

  return response.json();
}

// TRACED: AE-FE-006
export async function fetchPipelines(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const response = await fetch(
    `${API_URL}/pipelines?page=${page}&pageSize=${pageSize}`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch pipelines: ${response.status}`);
  }

  return response.json();
}
