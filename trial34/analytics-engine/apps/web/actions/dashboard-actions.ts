'use server';

// TRACED: AE-FC-ACTION-001 — Server Action with 'use server' and response.ok check
export async function fetchDashboards() {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/dashboards`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboards');
  }
  return res.json();
}

export async function createDashboard(name: string, description: string) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/dashboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) {
    throw new Error('Failed to create dashboard');
  }
  return res.json();
}
