// TRACED: FD-SERVER-ACTIONS
'use server';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function fetchWorkOrders() {
  const response = await fetch(`${API_URL}/work-orders`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch work orders');
  }
  return response.json();
}

export async function fetchTechnicians() {
  const response = await fetch(`${API_URL}/technicians`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch technicians');
  }
  return response.json();
}

export async function fetchSchedules() {
  const response = await fetch(`${API_URL}/schedules`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch schedules');
  }
  return response.json();
}

export async function fetchServiceAreas() {
  const response = await fetch(`${API_URL}/service-areas`, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch service areas');
  }
  return response.json();
}

export async function loginAction(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  return response.json();
}
