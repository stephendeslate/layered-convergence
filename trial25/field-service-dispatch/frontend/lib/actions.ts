// [TRACED:UI-006] Server Actions with 'use server' directive, all check response.ok
'use server';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: string,
  companyId: string,
) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, companyId }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

export async function getWorkOrders(token: string) {
  const response = await fetch(`${API_BASE}/work-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch work orders');
  }

  return response.json();
}

export async function getTechnicians(token: string) {
  const response = await fetch(`${API_BASE}/technicians`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch technicians');
  }

  return response.json();
}

export async function getRoutes(token: string) {
  const response = await fetch(`${API_BASE}/routes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch routes');
  }

  return response.json();
}

export async function getInvoices(token: string) {
  const response = await fetch(`${API_BASE}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }

  return response.json();
}

export async function updateWorkOrderStatus(
  id: string,
  status: string,
  token: string,
) {
  const response = await fetch(`${API_BASE}/work-orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update work order status');
  }

  return response.json();
}

export async function updateRouteStatus(
  id: string,
  status: string,
  token: string,
) {
  const response = await fetch(`${API_BASE}/routes/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update route status');
  }

  return response.json();
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
  token: string,
) {
  const response = await fetch(`${API_BASE}/invoices/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update invoice status');
  }

  return response.json();
}
