'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function validateRequiredString(
  formData: FormData,
  field: string,
): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required and must be a non-empty string`);
  }
  return value.trim();
}

function validateOptionalString(
  formData: FormData,
  field: string,
): string | undefined {
  const value = formData.get(field);
  if (value === null || value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function createDataSource(formData: FormData) {
  const name = validateRequiredString(formData, 'name');
  const type = validateRequiredString(formData, 'type');

  const validTypes = ['POSTGRESQL', 'MYSQL', 'CSV', 'API'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid data source type: ${type}. Must be one of: ${validTypes.join(', ')}`);
  }

  const host = validateOptionalString(formData, 'host');
  const port = validateOptionalString(formData, 'port');
  const database = validateOptionalString(formData, 'database');

  const config: Record<string, string> = {};
  if (host) config['host'] = host;
  if (port) config['port'] = port;
  if (database) config['database'] = database;

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/data-sources`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, type, config }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create data source' }));
    throw new Error(error.message ?? 'Failed to create data source');
  }

  revalidatePath('/data-sources');
  return response.json();
}

export async function createDashboard(formData: FormData) {
  const name = validateRequiredString(formData, 'name');
  const description = validateOptionalString(formData, 'description');
  const isPublicRaw = formData.get('isPublic');
  const isPublic = isPublicRaw === 'true' || isPublicRaw === 'on';

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, description, isPublic }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create dashboard' }));
    throw new Error(error.message ?? 'Failed to create dashboard');
  }

  revalidatePath('/dashboards');
  return response.json();
}

export async function createWidget(formData: FormData) {
  const dashboardId = validateRequiredString(formData, 'dashboardId');
  const type = validateRequiredString(formData, 'type');
  const title = validateRequiredString(formData, 'title');

  const validTypes = ['LINE', 'BAR', 'PIE', 'METRIC', 'TABLE'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid widget type: ${type}. Must be one of: ${validTypes.join(', ')}`);
  }

  const configRaw = validateOptionalString(formData, 'config');
  let config: Record<string, unknown> = {};
  if (configRaw) {
    try {
      config = JSON.parse(configRaw) as Record<string, unknown>;
    } catch {
      throw new Error('config must be valid JSON');
    }
  }

  const position = { x: 0, y: 0, w: 6, h: 4 };

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/widgets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ dashboardId, type, title, config, position }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create widget' }));
    throw new Error(error.message ?? 'Failed to create widget');
  }

  revalidatePath(`/dashboards/${dashboardId}`);
  return response.json();
}

export async function createEmbed(formData: FormData) {
  const dashboardId = validateRequiredString(formData, 'dashboardId');
  const originsRaw = validateRequiredString(formData, 'allowedOrigins');

  const allowedOrigins = originsRaw
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  if (allowedOrigins.length === 0) {
    throw new Error('At least one allowed origin is required');
  }

  const expiresAt = validateOptionalString(formData, 'expiresAt');

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/embeds`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ dashboardId, allowedOrigins, expiresAt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create embed' }));
    throw new Error(error.message ?? 'Failed to create embed');
  }

  revalidatePath('/embeds');
  return response.json();
}

export async function transitionPipeline(pipelineId: string, targetStatus: string) {
  const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'FAILED', 'COMPLETED'];
  if (!validStatuses.includes(targetStatus)) {
    throw new Error(`Invalid target status: ${targetStatus}. Must be one of: ${validStatuses.join(', ')}`);
  }

  if (typeof pipelineId !== 'string' || pipelineId.trim().length === 0) {
    throw new Error('pipelineId is required and must be a non-empty string');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/pipelines/${pipelineId.trim()}/transition`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ targetStatus }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to transition pipeline' }));
    throw new Error(error.message ?? 'Failed to transition pipeline');
  }

  revalidatePath('/pipelines');
  return response.json();
}

export async function deleteDataSource(id: string) {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('Data source ID is required');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/data-sources/${id.trim()}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete data source' }));
    throw new Error(error.message ?? 'Failed to delete data source');
  }

  revalidatePath('/data-sources');
}

export async function deleteDashboard(id: string) {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('Dashboard ID is required');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/dashboards/${id.trim()}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete dashboard' }));
    throw new Error(error.message ?? 'Failed to delete dashboard');
  }

  revalidatePath('/dashboards');
}

export async function deleteEmbed(id: string) {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('Embed ID is required');
  }

  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/embeds/${id.trim()}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete embed' }));
    throw new Error(error.message ?? 'Failed to delete embed');
  }

  revalidatePath('/embeds');
}

export async function loginAction(formData: FormData) {
  const email = validateRequiredString(formData, 'email');
  const password = validateRequiredString(formData, 'password');

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message ?? 'Login failed');
  }

  const data = await response.json();

  const cookieStore = await cookies();
  cookieStore.set('token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  revalidatePath('/');
  return { success: true, user: data.user };
}

export async function registerAction(formData: FormData) {
  const email = validateRequiredString(formData, 'email');
  const password = validateRequiredString(formData, 'password');
  const name = validateRequiredString(formData, 'name');
  const tenantId = validateRequiredString(formData, 'tenantId');

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, tenantId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message ?? 'Registration failed');
  }

  const data = await response.json();

  const cookieStore = await cookies();
  cookieStore.set('token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  revalidatePath('/');
  return { success: true, user: data.user };
}
