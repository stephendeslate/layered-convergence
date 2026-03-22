// TRACED: FD-API-001 — Server actions with response.ok validation
'use server';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getWorkOrders(page = 1, pageSize = 20) {
  return fetchApi(`/work-orders?page=${page}&pageSize=${pageSize}`);
}

export async function getWorkOrder(id: string) {
  return fetchApi(`/work-orders/${encodeURIComponent(id)}`);
}

export async function getTechnicians(page = 1, pageSize = 20) {
  return fetchApi(`/technicians?page=${page}&pageSize=${pageSize}`);
}

export async function getTechnician(id: string) {
  return fetchApi(`/technicians/${encodeURIComponent(id)}`);
}

export async function getSchedules(page = 1, pageSize = 20) {
  return fetchApi(`/schedules?page=${page}&pageSize=${pageSize}`);
}

export async function getServiceAreas(page = 1, pageSize = 20) {
  return fetchApi(`/service-areas?page=${page}&pageSize=${pageSize}`);
}

export async function getHealth() {
  return fetchApi('/health');
}

export async function getMetrics() {
  return fetchApi('/metrics');
}
