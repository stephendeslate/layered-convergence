'use server';

// TRACED: FD-FC-ACTION-002 — Technician server action with response.ok check
export async function fetchTechnicians() {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/technicians`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch technicians');
  }
  return res.json();
}

export async function createTechnician(name: string, specialization: string) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/technicians`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, specialization }),
  });
  if (!res.ok) {
    throw new Error('Failed to create technician');
  }
  return res.json();
}
