import { cookies } from 'next/headers';
import type { Dashboard, DataSource, Pipeline, Embed } from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorBody.message ?? `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDashboards(): Promise<Dashboard[]> {
  return apiFetch<Dashboard[]>('/dashboards');
}

export async function fetchDashboard(id: string): Promise<Dashboard> {
  return apiFetch<Dashboard>(`/dashboards/${id}`);
}

export async function fetchDataSources(): Promise<DataSource[]> {
  return apiFetch<DataSource[]>('/data-sources');
}

export async function fetchDataSource(id: string): Promise<DataSource> {
  return apiFetch<DataSource>(`/data-sources/${id}`);
}

export async function fetchPipelines(): Promise<Pipeline[]> {
  return apiFetch<Pipeline[]>('/pipelines');
}

export async function fetchPipeline(id: string): Promise<Pipeline> {
  return apiFetch<Pipeline>(`/pipelines/${id}`);
}

export async function fetchEmbeds(): Promise<Embed[]> {
  return apiFetch<Embed[]>('/embeds');
}
