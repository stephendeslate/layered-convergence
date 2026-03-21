import { cookies } from 'next/headers';
import type { Transaction, Dispute, Payout, AuthResponse, User } from './types';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: string,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  });
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export async function getTransactions(status?: string): Promise<Transaction[]> {
  const params = status ? `?status=${status}` : '';
  return apiFetch<Transaction[]>(`/transactions${params}`);
}

export async function getTransaction(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`);
}

export async function createTransaction(data: {
  title: string;
  amount: number;
  sellerId: string;
  description?: string;
}): Promise<Transaction> {
  return apiFetch<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function transitionTransaction(
  id: string,
  action: string,
): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}/transition`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  return apiFetch<Record<string, number>>('/transactions/status-counts');
}

export async function getDisputes(): Promise<Dispute[]> {
  return apiFetch<Dispute[]>('/disputes');
}

export async function getDispute(id: string): Promise<Dispute> {
  return apiFetch<Dispute>(`/disputes/${id}`);
}

export async function createDispute(data: {
  transactionId: string;
  reason: string;
  evidence?: string;
}): Promise<Dispute> {
  return apiFetch<Dispute>('/disputes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolveDispute(
  id: string,
  resolution: string,
): Promise<Dispute> {
  return apiFetch<Dispute>(`/disputes/${id}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ resolution }),
  });
}

export async function getPayouts(): Promise<Payout[]> {
  return apiFetch<Payout[]>('/payouts');
}
