'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthResponse } from '@/lib/types';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

function validateRequiredString(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function validateOptionalString(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function loginAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  try {
    const email = validateRequiredString(formData, 'email');
    const password = validateRequiredString(formData, 'password');

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Login failed' }));
      return { error: body.message ?? 'Login failed', success: false };
    }

    const data: AuthResponse = await response.json();

    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return { error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { error: message, success: false };
  }
}

export async function registerAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData,
): Promise<{ error: string | null; success: boolean }> {
  try {
    const email = validateRequiredString(formData, 'email');
    const password = validateRequiredString(formData, 'password');
    const name = validateRequiredString(formData, 'name');
    const tenantId = validateRequiredString(formData, 'tenantId');
    const role = validateOptionalString(formData, 'role');

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, tenantId, role }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ message: 'Registration failed' }));
      return { error: body.message ?? 'Registration failed', success: false };
    }

    const data: AuthResponse = await response.json();

    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return { error: null, success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { error: message, success: false };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function createDashboard(formData: FormData) {
  const name = validateRequiredString(formData, 'name');
  const description = validateOptionalString(formData, 'description');

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });

  redirect('/dashboards');
}

export async function createDataSource(formData: FormData) {
  const name = validateRequiredString(formData, 'name');
  const type = validateRequiredString(formData, 'type');
  const connectionString = validateRequiredString(formData, 'connectionString');

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await fetch(`${API_URL}/data-sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, type, connectionString }),
  });

  redirect('/data-sources');
}

export async function transitionPipeline(formData: FormData) {
  const pipelineId = validateRequiredString(formData, 'pipelineId');
  const status = validateRequiredString(formData, 'status');

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await fetch(`${API_URL}/pipelines/${pipelineId}/transition`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  redirect('/pipelines');
}

export async function createEmbed(formData: FormData) {
  const dashboardId = validateRequiredString(formData, 'dashboardId');

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await fetch(`${API_URL}/embeds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ dashboardId }),
  });

  redirect('/dashboards');
}

export async function deleteDashboard(formData: FormData) {
  const dashboardId = validateRequiredString(formData, 'dashboardId');

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  await fetch(`${API_URL}/dashboards/${dashboardId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  redirect('/dashboards');
}
