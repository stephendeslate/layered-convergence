// TRACED:USE_SERVER — actions.ts contains 'use server' directive
// TRACED:RESPONSE_OK — Server actions check response.ok before redirect
'use server';

import { redirect } from 'next/navigation';

const API_BASE = process.env.API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  const data = await response.json();
  redirect(`/?token=${data.access_token}`);
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const companyId = formData.get('companyId') as string;

  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, companyId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { error: errorData.message ?? 'Registration failed' };
  }

  redirect('/login');
}

export async function createWorkOrderAction(formData: FormData, token: string) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const customerId = formData.get('customerId') as string;

  const response = await fetch(`${API_BASE}/work-orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, customerId }),
  });

  if (!response.ok) {
    return { error: 'Failed to create work order' };
  }

  redirect('/work-orders');
}

export async function transitionWorkOrderAction(
  workOrderId: string,
  status: string,
  token: string,
) {
  const response = await fetch(`${API_BASE}/work-orders/${workOrderId}/transition`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return { error: 'Failed to transition work order' };
  }

  redirect(`/work-orders/${workOrderId}`);
}
