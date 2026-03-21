'use server';

// TRACED: AE-FC-ACTION-002 — Pipeline server action with response.ok check
export async function fetchPipelines() {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/pipelines`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch pipelines');
  }
  return res.json();
}

export async function updatePipelineStatus(id: string, status: string) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/pipelines/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update pipeline status');
  }
  return res.json();
}
