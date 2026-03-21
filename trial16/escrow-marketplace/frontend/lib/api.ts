import { cookies } from 'next/headers';
import type {
  Transaction,
  Dispute,
  Payout,
  StatusCounts,
  User,
} from './types';

const API_BASE = process.env.API_URL || 'http://localhost:3000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function apiMutate<T>(
  path: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message =
      (errorBody as Record<string, string>).message ||
      `API error: ${res.status}`;
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function getTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>('/transactions');
}

export async function getTransaction(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`);
}

export async function getStatusCounts(): Promise<StatusCounts> {
  return apiFetch<StatusCounts>('/transactions/status-counts');
}

export async function createTransaction(data: {
  title: string;
  description?: string;
  amount: number;
  sellerId: string;
}): Promise<Transaction> {
  return apiMutate<Transaction>('/transactions', 'POST', data);
}

export async function transitionTransaction(
  id: string,
  action: string,
): Promise<Transaction> {
  return apiMutate<Transaction>(`/transactions/${id}/transition`, 'PATCH', {
    action,
  });
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
  return apiMutate<Dispute>('/disputes', 'POST', data);
}

export async function resolveDispute(
  id: string,
  resolution: string,
): Promise<Dispute> {
  return apiMutate<Dispute>(`/disputes/${id}/resolve`, 'PATCH', { resolution });
}

export async function getPayouts(): Promise<Payout[]> {
  return apiFetch<Payout[]>('/payouts');
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/auth/me');
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  return apiMutate<{ user: User; token: string }>('/auth/login', 'POST', data);
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
}): Promise<{ user: User; token: string }> {
  return apiMutate<{ user: User; token: string }>(
    '/auth/register',
    'POST',
    data,
  );
}
