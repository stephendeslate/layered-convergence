// TRACED: AE-FE-03
'use server';

const API_BASE = process.env.API_URL ?? 'http://localhost:3001';

export async function fetchDashboards() {
  const response = await fetch(`${API_BASE}/dashboards`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.status}`);
  }

  return response.json();
}

export async function fetchPipelines() {
  const response = await fetch(`${API_BASE}/pipelines`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pipelines: ${response.status}`);
  }

  return response.json();
}

export async function fetchReports() {
  const response = await fetch(`${API_BASE}/reports`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  return response.json();
}
