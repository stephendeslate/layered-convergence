'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateRequiredString, validateRequiredNumber } from '@/lib/validation';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// --- Auth Actions ---

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = validateRequiredString(formData, 'email');
  if (!email) return { error: 'Email is required' };

  const password = validateRequiredString(formData, 'password');
  if (!password) return { error: 'Password is required' };

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Login failed' }));
    return { error: data.message || 'Login failed' };
  }

  const data = await response.json();

  const cookieStore = await cookies();
  cookieStore.set('token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });
  cookieStore.set('user', JSON.stringify(data.user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });

  redirect('/transactions');
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const email = validateRequiredString(formData, 'email');
  if (!email) return { error: 'Email is required' };

  const password = validateRequiredString(formData, 'password');
  if (!password) return { error: 'Password is required' };

  const role = validateRequiredString(formData, 'role');
  if (!role) return { error: 'Role is required' };

  if (role !== 'BUYER' && role !== 'SELLER') {
    return { error: 'Role must be BUYER or SELLER' };
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Registration failed' }));
    return { error: data.message || 'Registration failed' };
  }

  const data = await response.json();

  const cookieStore = await cookies();
  cookieStore.set('token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });
  cookieStore.set('user', JSON.stringify(data.user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
  });

  redirect('/transactions');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
  redirect('/login');
}

// --- Transaction Actions ---

export async function createTransactionAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const sellerId = validateRequiredString(formData, 'sellerId');
  if (!sellerId) return { error: 'Seller ID is required' };

  const amount = validateRequiredNumber(formData, 'amount');
  if (!amount || amount <= 0) return { error: 'Valid amount is required' };

  const description = validateRequiredString(formData, 'description');
  if (!description) return { error: 'Description is required' };

  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sellerId, amount, description }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create transaction' }));
    return { error: data.message || 'Failed to create transaction' };
  }

  redirect('/transactions');
}

export async function updateTransactionStatusAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const transactionId = validateRequiredString(formData, 'transactionId');
  if (!transactionId) return { error: 'Transaction ID is required' };

  const status = validateRequiredString(formData, 'status');
  if (!status) return { error: 'Status is required' };

  const response = await fetch(`${API_URL}/transactions/${transactionId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to update transaction' }));
    return { error: data.message || 'Failed to update transaction' };
  }

  redirect('/transactions');
}

// --- Dispute Actions ---

export async function createDisputeAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const transactionId = validateRequiredString(formData, 'transactionId');
  if (!transactionId) return { error: 'Transaction ID is required' };

  const reason = validateRequiredString(formData, 'reason');
  if (!reason) return { error: 'Reason is required' };

  const response = await fetch(`${API_URL}/disputes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionId, reason }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create dispute' }));
    return { error: data.message || 'Failed to create dispute' };
  }

  redirect('/disputes');
}

export async function resolveDisputeAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const disputeId = validateRequiredString(formData, 'disputeId');
  if (!disputeId) return { error: 'Dispute ID is required' };

  const resolution = validateRequiredString(formData, 'resolution');
  if (!resolution) return { error: 'Resolution is required' };

  const response = await fetch(`${API_URL}/disputes/${disputeId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ resolution }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to resolve dispute' }));
    return { error: data.message || 'Failed to resolve dispute' };
  }

  redirect('/disputes');
}

// --- Payout Actions ---

export async function createPayoutAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const transactionId = validateRequiredString(formData, 'transactionId');
  if (!transactionId) return { error: 'Transaction ID is required' };

  const response = await fetch(`${API_URL}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ transactionId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create payout' }));
    return { error: data.message || 'Failed to create payout' };
  }

  redirect('/payouts');
}

// --- Webhook Actions ---

export async function createWebhookAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const url = validateRequiredString(formData, 'url');
  if (!url) return { error: 'URL is required' };

  const event = validateRequiredString(formData, 'event');
  if (!event) return { error: 'Event is required' };

  const response = await fetch(`${API_URL}/webhooks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, event }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create webhook' }));
    return { error: data.message || 'Failed to create webhook' };
  }

  redirect('/webhooks');
}
