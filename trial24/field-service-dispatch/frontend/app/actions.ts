// [TRACED:UI-008] actions.ts with 'use server' directive for Server Actions
// [TRACED:UI-009] Server Actions check response.ok before redirect
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

export async function createCustomerAction(formData: FormData, token: string) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;

  const response = await fetch(`${API_BASE}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, phone }),
  });

  if (!response.ok) {
    return { error: 'Failed to create customer' };
  }

  redirect('/customers');
}

export async function createInvoiceAction(formData: FormData, token: string) {
  const invoiceNumber = formData.get('invoiceNumber') as string;
  const amount = Number(formData.get('amount'));
  const taxAmount = Number(formData.get('taxAmount'));
  const totalAmount = Number(formData.get('totalAmount'));
  const workOrderId = formData.get('workOrderId') as string;
  const customerId = formData.get('customerId') as string;

  const response = await fetch(`${API_BASE}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ invoiceNumber, amount, taxAmount, totalAmount, workOrderId, customerId }),
  });

  if (!response.ok) {
    return { error: 'Failed to create invoice' };
  }

  redirect('/invoices');
}
