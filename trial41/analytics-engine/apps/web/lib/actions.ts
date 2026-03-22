// TRACED:AE-SERVER-ACTIONS
'use server';

import { CACHE_CONTROL_LIST } from '@analytics-engine/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchApi(path: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `HTTP ${response.status}`);
  }

  return response.json();
}

export async function login(email: string, password: string) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  tenantId: string;
}) {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchEvents(token: string) {
  return fetchApi('/events', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchDashboards(token: string) {
  return fetchApi('/dashboards', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchDataSources(token: string) {
  return fetchApi('/data-sources', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchPipelines(token: string) {
  return fetchApi('/pipelines', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
