'use server';

import { redirect } from 'next/navigation';

const API_BASE = process.env.API_URL || 'http://localhost:3001/api';

// TRACED:AC-005: Response bodies use consistent envelope structure

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || 'Login failed' };
  }

  const data = await response.json();
  // In production, set HTTP-only cookie with the token
  redirect(`/transactions?token=${data.access_token}`);
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || 'Registration failed' };
  }

  redirect('/login');
}

export async function createTransactionAction(formData: FormData) {
  const token = formData.get('token') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const sellerId = formData.get('sellerId') as string;

  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, description, sellerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || 'Failed to create transaction' };
  }

  const data = await response.json();
  redirect(`/transactions/${data.id}`);
}

export async function updateTransactionStatusAction(
  transactionId: string,
  status: string,
  token: string,
) {
  const response = await fetch(
    `${API_BASE}/transactions/${transactionId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return { error: error.message || 'Failed to update status' };
  }

  redirect(`/transactions/${transactionId}`);
}
