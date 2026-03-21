import { cookies } from 'next/headers';
import type { WorkOrder, Technician, Customer, Route, Invoice, WorkOrderStatus, StatusCounts } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getWorkOrders(status?: WorkOrderStatus): Promise<WorkOrder[]> {
  const params = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch<WorkOrder[]>(`/work-orders${params}`);
}

export async function getWorkOrder(id: string): Promise<WorkOrder> {
  return apiFetch<WorkOrder>(`/work-orders/${encodeURIComponent(id)}`);
}

export async function getStatusCounts(): Promise<StatusCounts[]> {
  return apiFetch<StatusCounts[]>('/work-orders/counts');
}

export async function getTechnicians(): Promise<Technician[]> {
  return apiFetch<Technician[]>('/technicians');
}

export async function getTechnician(id: string): Promise<Technician> {
  return apiFetch<Technician>(`/technicians/${encodeURIComponent(id)}`);
}

export async function getCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>('/customers');
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiFetch<Customer>(`/customers/${encodeURIComponent(id)}`);
}

export async function getRoutes(): Promise<Route[]> {
  return apiFetch<Route[]>('/routes');
}

export async function getRoute(id: string): Promise<Route> {
  return apiFetch<Route>(`/routes/${encodeURIComponent(id)}`);
}

export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>('/invoices');
}

export async function getInvoice(id: string): Promise<Invoice> {
  return apiFetch<Invoice>(`/invoices/${encodeURIComponent(id)}`);
}

export async function apiPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiPatch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
