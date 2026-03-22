// TRACED:AE-FE-08 — Server actions with response.ok checks

'use server';

const API_BASE = process.env.API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

interface DashboardResponse {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
}

interface PipelineResponse {
  id: string;
  name: string;
  status: string;
  schedule?: string;
}

interface ReportResponse {
  id: string;
  title: string;
  format: string;
  content?: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export async function fetchDashboards(): Promise<DashboardResponse[]> {
  try {
    const result = await apiFetch<PaginatedResponse<DashboardResponse>>('/dashboards?page=1&pageSize=50');
    return result.data;
  } catch {
    return [];
  }
}

export async function fetchPipelines(): Promise<PipelineResponse[]> {
  try {
    const result = await apiFetch<PaginatedResponse<PipelineResponse>>('/pipelines?page=1&pageSize=50');
    return result.data;
  } catch {
    return [];
  }
}

export async function fetchReports(): Promise<ReportResponse[]> {
  try {
    const result = await apiFetch<ReportResponse[]>('/reports?page=1&pageSize=50');
    return result;
  } catch {
    return [];
  }
}
