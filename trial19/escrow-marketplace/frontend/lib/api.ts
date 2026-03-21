import 'server-only';
import { cookies } from 'next/headers';
import type { AuthResponse, Transaction, Dispute, Payout } from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers ?? {}) as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String(body.message)
      : `API error: ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(email: string, password: string, role: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  });
}

export async function fetchTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>('/transactions');
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`);
}

export async function createTransaction(data: {
  title: string;
  description?: string;
  amount: number;
  sellerId: string;
}): Promise<Transaction> {
  return apiFetch<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTransactionStatus(id: string, status: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchDisputes(): Promise<Dispute[]> {
  return apiFetch<Dispute[]>('/disputes');
}

export async function fetchDispute(id: string): Promise<Dispute> {
  return apiFetch<Dispute>(`/disputes/${id}`);
}

export async function createDispute(data: {
  transactionId: string;
  reason: string;
}): Promise<Dispute> {
  return apiFetch<Dispute>('/disputes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolveDispute(id: string, resolution: string): Promise<Dispute> {
  return apiFetch<Dispute>(`/disputes/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolution }),
  });
}

export async function fetchPayouts(): Promise<Payout[]> {
  return apiFetch<Payout[]>('/payouts');
}
