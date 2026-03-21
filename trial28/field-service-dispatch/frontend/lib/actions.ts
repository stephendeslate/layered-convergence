'use server';

const API_BASE = process.env.API_URL ?? 'http://localhost:4002';

export async function registerUser(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const body = {
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
    role: formData.get('role'),
  };

  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    return { success: false, error: data.message ?? 'Registration failed' };
  }

  return { success: true };
}

export async function loginUser(formData: FormData): Promise<{ success: boolean; token?: string; error?: string }> {
  const body = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json();
    return { success: false, error: data.message ?? 'Login failed' };
  }

  const data = await response.json();
  return { success: true, token: data.accessToken };
}

export async function fetchWorkOrders(): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  const response = await fetch(`${API_BASE}/work-orders`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to fetch work orders' };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function fetchInvoices(): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
  const response = await fetch(`${API_BASE}/invoices`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to fetch invoices' };
  }

  const data = await response.json();
  return { success: true, data };
}
