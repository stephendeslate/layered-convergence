// [TRACED:FD-UI-006] Server actions with 'use server' directive and response.ok check
'use server';

import { redirect } from 'next/navigation';
import type { WorkOrderDto, CustomerDto, TechnicianDto, RouteDto, InvoiceDto } from '@field-service-dispatch/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  redirect('/work-orders');
}

export async function registerAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const companyId = formData.get('companyId') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, companyId }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  redirect('/login');
}

export async function fetchWorkOrders(): Promise<WorkOrderDto[]> {
  const response = await fetch(`${API_URL}/work-orders`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch work orders');
  }

  return response.json() as Promise<WorkOrderDto[]>;
}

export async function fetchCustomers(): Promise<CustomerDto[]> {
  const response = await fetch(`${API_URL}/customers`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json() as Promise<CustomerDto[]>;
}

export async function fetchTechnicians(): Promise<TechnicianDto[]> {
  const response = await fetch(`${API_URL}/technicians`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch technicians');
  }

  return response.json() as Promise<TechnicianDto[]>;
}

export async function fetchRoutes(): Promise<RouteDto[]> {
  const response = await fetch(`${API_URL}/routes`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }

  return response.json() as Promise<RouteDto[]>;
}

export async function fetchInvoices(): Promise<InvoiceDto[]> {
  const response = await fetch(`${API_URL}/invoices`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json() as Promise<InvoiceDto[]>;
}
