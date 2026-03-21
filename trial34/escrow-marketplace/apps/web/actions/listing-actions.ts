'use server';

// TRACED: EM-FC-ACTION-001 — Server Action with 'use server' and response.ok check
export async function fetchListings() {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/listings`, { cache: 'no-store' });
  if (!res.ok) { throw new Error('Failed to fetch listings'); }
  return res.json();
}

export async function createListing(title: string, description: string, price: number) {
  const res = await fetch(`${process.env.API_URL ?? 'http://localhost:3001'}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, price }),
  });
  if (!res.ok) { throw new Error('Failed to create listing'); }
  return res.json();
}
