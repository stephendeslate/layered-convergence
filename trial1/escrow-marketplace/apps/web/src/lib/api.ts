import type {
  AuthResponse,
  UserDto,
  TransactionDto,
  TransactionStateHistoryDto,
  DisputeDto,
  PayoutDto,
  OnboardingStatusDto,
  PlatformAnalytics,
  PaginatedResponse,
} from '@cpm/shared';
import type {
  RegisterInput,
  LoginInput,
  CreateTransactionInput,
  CreateDisputeInput,
  SubmitEvidenceInput,
  ResolveDisputeInput,
} from '@cpm/shared';

// ─── Configuration ──────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ─── Token Management ───────────────────────────────────────────────────────

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

let refreshToken: string | null = null;

export function setRefreshToken(token: string | null) {
  refreshToken = token;
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
  }
}

function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (typeof window !== 'undefined') {
    refreshToken = localStorage.getItem('refreshToken');
  }
  return refreshToken;
}

// ─── HTTP Client ────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export { ApiError };

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as AuthResponse;
    setAccessToken(data.tokens.accessToken);
    setRefreshToken(data.tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 with token refresh
  if (res.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = attemptTokenRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await (refreshPromise || attemptTokenRefresh());
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    let body: { message?: string; error?: string } = {};
    try {
      body = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      body.message || res.statusText,
      body.error,
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ─── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  register(data: RegisterInput): Promise<AuthResponse> {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  login(data: LoginInput): Promise<AuthResponse> {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  refresh(): Promise<AuthResponse> {
    return fetchApi('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
  },
};

// ─── Users API ──────────────────────────────────────────────────────────────

export const usersApi = {
  getMe(): Promise<UserDto> {
    return fetchApi('/users/me');
  },
  updateMe(data: Partial<Pick<UserDto, 'displayName'>>): Promise<UserDto> {
    return fetchApi('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  listProviders(): Promise<UserDto[]> {
    return fetchApi('/users/providers');
  },
};

// ─── Transactions API ───────────────────────────────────────────────────────

export const transactionsApi = {
  create(data: CreateTransactionInput): Promise<TransactionDto> {
    return fetchApi('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<TransactionDto>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return fetchApi(`/transactions${query ? `?${query}` : ''}`);
  },
  get(id: string): Promise<TransactionDto> {
    return fetchApi(`/transactions/${id}`);
  },
  deliver(id: string): Promise<TransactionDto> {
    return fetchApi(`/transactions/${id}/deliver`, { method: 'POST' });
  },
  confirm(id: string): Promise<TransactionDto> {
    return fetchApi(`/transactions/${id}/confirm`, { method: 'POST' });
  },
  release(id: string): Promise<TransactionDto> {
    return fetchApi(`/transactions/${id}/release`, { method: 'POST' });
  },
  getHistory(id: string): Promise<TransactionStateHistoryDto[]> {
    return fetchApi(`/transactions/${id}/history`);
  },
};

// ─── Disputes API ───────────────────────────────────────────────────────────

export const disputesApi = {
  create(data: CreateDisputeInput): Promise<DisputeDto> {
    return fetchApi('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  list(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<DisputeDto>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return fetchApi(`/disputes${query ? `?${query}` : ''}`);
  },
  get(id: string): Promise<DisputeDto> {
    return fetchApi(`/disputes/${id}`);
  },
  submitEvidence(id: string, data: SubmitEvidenceInput): Promise<DisputeDto> {
    return fetchApi(`/disputes/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  resolve(id: string, data: ResolveDisputeInput): Promise<DisputeDto> {
    return fetchApi(`/disputes/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ─── Payouts API ────────────────────────────────────────────────────────────

export const payoutsApi = {
  list(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<PayoutDto>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return fetchApi(`/payouts${query ? `?${query}` : ''}`);
  },
  get(id: string): Promise<PayoutDto> {
    return fetchApi(`/payouts/${id}`);
  },
};

// ─── Onboarding API ─────────────────────────────────────────────────────────

export const onboardingApi = {
  start(): Promise<{ onboardingUrl: string }> {
    return fetchApi('/onboarding/start', { method: 'POST' });
  },
  getStatus(): Promise<OnboardingStatusDto> {
    return fetchApi('/onboarding/status');
  },
  refreshLink(): Promise<{ onboardingUrl: string }> {
    return fetchApi('/onboarding/refresh-link', { method: 'POST' });
  },
};

// ─── Admin API ──────────────────────────────────────────────────────────────

export const adminApi = {
  listTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<TransactionDto>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return fetchApi(`/admin/transactions${query ? `?${query}` : ''}`);
  },
  listDisputes(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<DisputeDto>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return fetchApi(`/admin/disputes${query ? `?${query}` : ''}`);
  },
  getAnalytics(): Promise<PlatformAnalytics> {
    return fetchApi('/admin/analytics');
  },
  listProviders(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserDto & { connectedAccount?: OnboardingStatusDto }>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return fetchApi(`/admin/providers${query ? `?${query}` : ''}`);
  },
  listWebhooks(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<{
    id: string;
    stripeEventId: string;
    eventType: string;
    status: string;
    errorMessage: string | null;
    processedAt: string | null;
    createdAt: string;
  }>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return fetchApi(`/admin/webhooks${query ? `?${query}` : ''}`);
  },
};
