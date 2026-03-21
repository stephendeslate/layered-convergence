import { cookies } from 'next/headers';
import type {
  AuthResult,
  DataSource,
  Dashboard,
  Pipeline,
  Widget,
  EmbedConfig,
} from './types';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getServerRequestOptions(): Promise<RequestInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const options = await getServerRequestOptions();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    ...init,
    headers: {
      ...options.headers,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
      statusCode: response.status,
    }));
    throw new Error(error.message ?? `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export class ApiClient {
  // Auth
  static async login(email: string, password: string): Promise<AuthResult> {
    return apiFetch<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(
    email: string,
    password: string,
    name: string,
    tenantId: string,
  ): Promise<AuthResult> {
    return apiFetch<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, tenantId }),
    });
  }

  // Data Sources (read only — mutations via Server Actions)
  static async getDataSources(): Promise<DataSource[]> {
    return apiFetch<DataSource[]>('/data-sources');
  }

  static async getDataSource(id: string): Promise<DataSource> {
    return apiFetch<DataSource>(`/data-sources/${id}`);
  }

  // Dashboards (read only — mutations via Server Actions)
  static async getDashboards(): Promise<Dashboard[]> {
    return apiFetch<Dashboard[]>('/dashboards');
  }

  static async getDashboard(id: string): Promise<Dashboard> {
    return apiFetch<Dashboard>(`/dashboards/${id}`);
  }

  // Pipelines (read only — mutations via Server Actions)
  static async getPipelines(): Promise<Pipeline[]> {
    return apiFetch<Pipeline[]>('/pipelines');
  }

  static async getPipeline(id: string): Promise<Pipeline> {
    return apiFetch<Pipeline>(`/pipelines/${id}`);
  }

  // Widgets (read only)
  static async getWidgets(dashboardId: string): Promise<Widget[]> {
    return apiFetch<Widget[]>(`/widgets?dashboardId=${dashboardId}`);
  }

  // Embeds (read only)
  static async getEmbeds(): Promise<EmbedConfig[]> {
    return apiFetch<EmbedConfig[]>('/embeds');
  }

  static async getEmbed(id: string): Promise<EmbedConfig> {
    return apiFetch<EmbedConfig>(`/embeds/${id}`);
  }

  static async getPublicEmbed(token: string): Promise<EmbedConfig> {
    return apiFetch<EmbedConfig>(`/embeds/public/${token}`);
  }
}
