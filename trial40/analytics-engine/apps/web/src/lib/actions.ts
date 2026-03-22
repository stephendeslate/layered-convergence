// TRACED:AE-FE-03 — Server Actions with 'use server' checking response.ok
'use server';

import { sanitizeInput } from '@analytics-engine/shared';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export async function fetchEvents(tenantId: string, page = 1): Promise<Record<string, unknown>> {
  const safeTenantId = sanitizeInput(tenantId);
  const response = await fetch(
    `${API_URL}/events?tenantId=${safeTenantId}&page=${page}&pageSize=20`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  return response.json();
}

export async function fetchDashboards(tenantId: string, page = 1): Promise<Record<string, unknown>> {
  const safeTenantId = sanitizeInput(tenantId);
  const response = await fetch(
    `${API_URL}/dashboards?tenantId=${safeTenantId}&page=${page}&pageSize=20`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.status}`);
  }

  return response.json();
}

export async function fetchDataSources(tenantId: string, page = 1): Promise<Record<string, unknown>> {
  const safeTenantId = sanitizeInput(tenantId);
  const response = await fetch(
    `${API_URL}/data-sources?tenantId=${safeTenantId}&page=${page}&pageSize=20`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch data sources: ${response.status}`);
  }

  return response.json();
}

export async function fetchPipelines(tenantId: string, page = 1): Promise<Record<string, unknown>> {
  const safeTenantId = sanitizeInput(tenantId);
  const response = await fetch(
    `${API_URL}/pipelines?tenantId=${safeTenantId}&page=${page}&pageSize=20`,
    { cache: 'no-store' },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch pipelines: ${response.status}`);
  }

  return response.json();
}
