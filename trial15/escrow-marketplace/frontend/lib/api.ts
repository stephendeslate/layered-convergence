import { cookies } from "next/headers";
import type {
  AuthResponse,
  CreateDisputeInput,
  CreateTransactionInput,
  Dispute,
  Payout,
  ResolveDisputeInput,
  StatusCounts,
  StripeAccount,
  Transaction,
  TransactionStatus,
  TransactionTransition,
  User,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

class ApiClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({
      message: response.statusText,
    }))) as { message: string };
    throw new ApiClientError(body.message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
}

export async function register(
  email: string,
  password: string,
  name: string,
  role: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, role }),
    cache: "no-store",
  });
}

export async function fetchTransactions(
  status?: TransactionStatus
): Promise<Transaction[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<Transaction[]>(`/transactions${query}`, {
    cache: "no-store",
  });
}

export async function fetchTransaction(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`, {
    cache: "no-store",
  });
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  return apiFetch<Transaction>("/transactions", {
    method: "POST",
    body: JSON.stringify(input),
    cache: "no-store",
  });
}

export async function transitionTransaction(
  id: string,
  action: TransactionTransition
): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}/${action}`, {
    method: "PATCH",
    cache: "no-store",
  });
}

export async function fetchDisputes(): Promise<Dispute[]> {
  return apiFetch<Dispute[]>("/disputes", {
    cache: "no-store",
  });
}

export async function createDispute(
  input: CreateDisputeInput
): Promise<Dispute> {
  return apiFetch<Dispute>("/disputes", {
    method: "POST",
    body: JSON.stringify(input),
    cache: "no-store",
  });
}

export async function resolveDispute(
  id: string,
  input: ResolveDisputeInput
): Promise<Dispute> {
  return apiFetch<Dispute>(`/disputes/${id}/resolve`, {
    method: "PATCH",
    body: JSON.stringify(input),
    cache: "no-store",
  });
}

export async function fetchPayouts(): Promise<Payout[]> {
  return apiFetch<Payout[]>("/payouts", {
    cache: "no-store",
  });
}

export async function fetchStripeAccounts(): Promise<StripeAccount[]> {
  return apiFetch<StripeAccount[]>("/stripe-accounts", {
    cache: "no-store",
  });
}

export async function createStripeAccount(): Promise<StripeAccount> {
  return apiFetch<StripeAccount>("/stripe-accounts", {
    method: "POST",
    cache: "no-store",
  });
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    return await apiFetch<User>("/auth/me", { cache: "no-store" });
  } catch {
    return null;
  }
}

export async function fetchStatusCounts(): Promise<StatusCounts> {
  const transactions = await fetchTransactions();
  const counts: StatusCounts = {
    PENDING: 0,
    FUNDED: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    RELEASED: 0,
    CANCELLED: 0,
    DISPUTED: 0,
    RESOLVED: 0,
    REFUNDED: 0,
  };

  for (const tx of transactions) {
    counts[tx.status] += 1;
  }

  return counts;
}

export { ApiClientError };
