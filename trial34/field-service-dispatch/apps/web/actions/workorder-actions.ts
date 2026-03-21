'use server';

// TRACED: FD-FC-ACTION-001 — Server Action with 'use server' and response.ok check
export async function fetchWorkOrders() {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/workorders`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch work orders');
  }
  return res.json();
}

export async function createWorkOrder(title: string, description: string, priority: string) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/workorders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, priority }),
  });
  if (!res.ok) {
    throw new Error('Failed to create work order');
  }
  return res.json();
}
