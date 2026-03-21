import 'server-only';
import { cookies } from 'next/headers';
import type { AuthResponse, Transaction, Dispute, Payout } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Login failed');
  }

  return res.json();
}

export async function apiRegister(
  email: string,
  password: string,
  role: string,
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Registration failed');
  }

  return res.json();
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return res.json();
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions/${id}`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch transaction');
  }

  return res.json();
}

export async function createTransaction(data: {
  title: string;
  description?: string;
  amount: number;
  sellerId: string;
}): Promise<Transaction> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to create transaction');
  }

  return res.json();
}

export async function updateTransactionStatus(
  id: string,
  status: string,
): Promise<Transaction> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/transactions/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to update status');
  }

  return res.json();
}

export async function fetchDisputes(): Promise<Dispute[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/disputes`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch disputes');
  }

  return res.json();
}

export async function fetchDispute(id: string): Promise<Dispute> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/disputes/${id}`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch dispute');
  }

  return res.json();
}

export async function createDispute(data: {
  transactionId: string;
  reason: string;
}): Promise<Dispute> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/disputes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? 'Failed to create dispute');
  }

  return res.json();
}

export async function fetchPayouts(): Promise<Payout[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/payouts`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch payouts');
  }

  return res.json();
}
