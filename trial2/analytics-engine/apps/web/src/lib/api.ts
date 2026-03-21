const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
  apiKey?: string;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, apiKey, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: { ...headers, ...(fetchOptions.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API error: ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    login: (slug: string, apiKey: string) =>
      apiFetch<{ accessToken: string; expiresIn: number }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ slug, apiKey }),
      }),
  },
  dashboards: {
    list: (token: string) =>
      apiFetch<{ data: Dashboard[]; nextCursor: string | null; hasMore: boolean }>(
        '/api/v1/dashboards',
        { token },
      ),
    get: (token: string, id: string) =>
      apiFetch<DashboardDetail>(`/api/v1/dashboards/${id}`, { token }),
    create: (token: string, data: { name: string; description?: string }) =>
      apiFetch<Dashboard>('/api/v1/dashboards', { token, method: 'POST', body: JSON.stringify(data) }),
    update: (token: string, id: string, data: Record<string, unknown>) =>
      apiFetch<Dashboard>(`/api/v1/dashboards/${id}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (token: string, id: string) =>
      apiFetch<void>(`/api/v1/dashboards/${id}`, { token, method: 'DELETE' }),
  },
  widgets: {
    create: (token: string, dashboardId: string, data: Record<string, unknown>) =>
      apiFetch<Widget>(`/api/v1/dashboards/${dashboardId}/widgets`, {
        token,
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (token: string, dashboardId: string, widgetId: string, data: Record<string, unknown>) =>
      apiFetch<Widget>(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (token: string, dashboardId: string, widgetId: string) =>
      apiFetch<void>(`/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`, {
        token,
        method: 'DELETE',
      }),
  },
  dataSources: {
    list: (token: string) =>
      apiFetch<{ data: DataSourceSummary[]; nextCursor: string | null; hasMore: boolean }>(
        '/api/v1/data-sources',
        { token },
      ),
    get: (token: string, id: string) =>
      apiFetch<DataSourceDetail>(`/api/v1/data-sources/${id}`, { token }),
    create: (token: string, data: Record<string, unknown>) =>
      apiFetch<DataSourceDetail>('/api/v1/data-sources', { token, method: 'POST', body: JSON.stringify(data) }),
    syncHistory: (token: string, dataSourceId: string) =>
      apiFetch<{ data: SyncRun[] }>(`/api/v1/data-sources/${dataSourceId}/sync/history`, { token }),
    triggerSync: (token: string, dataSourceId: string) =>
      apiFetch<{ jobId: string }>(`/api/v1/data-sources/${dataSourceId}/sync/trigger`, {
        token,
        method: 'POST',
      }),
  },
  query: {
    execute: (token: string, params: Record<string, unknown>) =>
      apiFetch<QueryResponse>('/api/v1/query', {
        token,
        method: 'POST',
        body: JSON.stringify(params),
      }),
  },
  embeds: {
    render: (embedId: string) =>
      apiFetch<EmbedRenderData>(`/api/v1/embeds/${embedId}/render`),
  },
};

export interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  widgetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardDetail {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  layout: Record<string, unknown>[];
  isPublished: boolean;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

export interface Widget {
  id: string;
  dashboardId: string;
  type: string;
  title: string | null;
  config: Record<string, unknown>;
  position: { col: number; row: number };
  size: { colSpan: number; rowSpan: number };
  dataSourceId: string | null;
}

export interface DataSourceSummary {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lastSyncStatus: string | null;
  lastSyncAt: string | null;
  createdAt: string;
}

export interface DataSourceDetail {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  config: Record<string, unknown>;
}

export interface SyncRun {
  id: string;
  dataSourceId: string;
  status: string;
  rowsIngested: number;
  errorLog: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface QueryResponse {
  data: Record<string, unknown>[];
  meta: { totalRows: number; cached: boolean; queryTimeMs: number };
}

export interface EmbedRenderData {
  embedId: string;
  dashboard: {
    id: string;
    name: string;
    widgets: Widget[];
    layout: Record<string, unknown>[];
  };
  branding: Record<string, unknown>;
  themeOverrides: Record<string, unknown>;
}
