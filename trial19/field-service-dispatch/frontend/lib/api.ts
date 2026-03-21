import { cookies } from 'next/headers';
import type { AuthResponse, WorkOrder, Technician, Route, Customer } from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(body.message ?? 'Login failed');
  }

  return res.json() as Promise<AuthResponse>;
}

export async function apiRegister(
  email: string,
  password: string,
  name: string,
  role: string,
  companyName: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, companyName }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(body.message ?? 'Registration failed');
  }

  return res.json() as Promise<AuthResponse>;
}

export async function fetchWorkOrders(): Promise<WorkOrder[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/work-orders`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Failed to fetch work orders');
  return res.json() as Promise<WorkOrder[]>;
}

export async function fetchWorkOrder(id: string): Promise<WorkOrder> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/work-orders/${id}`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Work order not found');
  return res.json() as Promise<WorkOrder>;
}

export async function fetchTechnicians(): Promise<Technician[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/technicians`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Failed to fetch technicians');
  return res.json() as Promise<Technician[]>;
}

export async function fetchTechnician(id: string): Promise<Technician> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/technicians/${id}`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Technician not found');
  return res.json() as Promise<Technician>;
}

export async function fetchCustomers(): Promise<Customer[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/customers`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json() as Promise<Customer[]>;
}

export async function fetchRoutes(): Promise<Route[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/routes`, {
    headers,
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json() as Promise<Route[]>;
}
