import { cookies } from 'next/headers';
import type { WorkOrder, Technician, Customer, Route, Invoice } from './types';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

export async function getWorkOrders(status?: string): Promise<WorkOrder[]> {
  const query = status ? `?status=${status}` : '';
  return apiFetch<WorkOrder[]>(`/work-orders${query}`);
}

export async function getWorkOrder(id: string): Promise<WorkOrder> {
  return apiFetch<WorkOrder>(`/work-orders/${id}`);
}

export async function getTechnicians(): Promise<Technician[]> {
  return apiFetch<Technician[]>('/technicians');
}

export async function getTechnician(id: string): Promise<Technician> {
  return apiFetch<Technician>(`/technicians/${id}`);
}

export async function getAvailableTechnicians(): Promise<Technician[]> {
  return apiFetch<Technician[]>('/technicians/available');
}

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers');
}

export async function getRoutes(): Promise<Route[]> {
  return apiFetch<Route[]>('/routes');
}

export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>('/invoices');
}

export { apiFetch, API_URL };
