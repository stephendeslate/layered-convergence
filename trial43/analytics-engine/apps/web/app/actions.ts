'use server';

import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

// TRACED:AE-UI-005
const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function loginAction(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Login failed' };
  }

  return response.json();
}

export async function fetchDashboards(token: string, tenantId: string) {
  const response = await fetch(`${API_URL}/dashboards?tenantId=${tenantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Failed to fetch dashboards' };
  }

  return response.json();
}

export async function fetchEvents(token: string, tenantId: string) {
  const response = await fetch(`${API_URL}/events?tenantId=${tenantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Failed to fetch events' };
  }

  return response.json();
}

export async function fetchDataSources(token: string, tenantId: string) {
  const response = await fetch(`${API_URL}/data-sources?tenantId=${tenantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Failed to fetch data sources' };
  }

  return response.json();
}

export async function fetchPipelines(token: string, tenantId: string) {
  const response = await fetch(`${API_URL}/pipelines?tenantId=${tenantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message ?? 'Failed to fetch pipelines' };
  }

  return response.json();
}

export function getSaltRounds() {
  return BCRYPT_SALT_ROUNDS;
}
