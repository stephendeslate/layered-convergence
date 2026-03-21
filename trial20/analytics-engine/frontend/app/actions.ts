'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateRequiredString, API_URL } from '@/lib/utils';
import type { ActionState } from '@/lib/types';

// ── Auth Actions ──

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const email = validateRequiredString(formData, 'email');
  if (!email) return { error: 'Email is required' };

  const password = validateRequiredString(formData, 'password');
  if (!password) return { error: 'Password is required' };

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Login failed' }));
    return { error: data.message || 'Login failed' };
  }

  const result = await response.json();
  const cookieStore = await cookies();
  cookieStore.set('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
  });

  redirect('/dashboards');
}

export async function registerAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const email = validateRequiredString(formData, 'email');
  if (!email) return { error: 'Email is required' };

  const name = validateRequiredString(formData, 'name');
  if (!name) return { error: 'Name is required' };

  const password = validateRequiredString(formData, 'password');
  if (!password) return { error: 'Password is required' };

  const tenantSlug = validateRequiredString(formData, 'tenantSlug');
  if (!tenantSlug) return { error: 'Organization slug is required' };

  const role = validateRequiredString(formData, 'role');
  if (!role) return { error: 'Role is required' };

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password, tenantSlug, role }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Registration failed' }));
    return { error: data.message || 'Registration failed' };
  }

  const result = await response.json();
  const cookieStore = await cookies();
  cookieStore.set('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400,
  });

  redirect('/dashboards');
}

export async function logoutAction(): Promise<void> {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/auth/login');
}

// ── Dashboard Actions ──

export async function createDashboardAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const name = validateRequiredString(formData, 'name');
  if (!name) return { error: 'Name is required' };

  const response = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create dashboard' }));
    return { error: data.message || 'Failed to create dashboard' };
  }

  redirect('/dashboards');
}

export async function deleteDashboardAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Dashboard ID is required' };

  const response = await fetch(`${API_URL}/dashboards/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to delete dashboard' }));
    return { error: data.message || 'Failed to delete dashboard' };
  }

  redirect('/dashboards');
}

// ── Data Source Actions ──

export async function createDataSourceAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const name = validateRequiredString(formData, 'name');
  if (!name) return { error: 'Name is required' };

  const type = validateRequiredString(formData, 'type');
  if (!type) return { error: 'Type is required' };

  const response = await fetch(`${API_URL}/data-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, type }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create data source' }));
    return { error: data.message || 'Failed to create data source' };
  }

  redirect('/data-sources');
}

export async function deleteDataSourceAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Data source ID is required' };

  const response = await fetch(`${API_URL}/data-sources/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to delete data source' }));
    return { error: data.message || 'Failed to delete data source' };
  }

  redirect('/data-sources');
}

// ── Pipeline Actions ──

export async function createPipelineAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const name = validateRequiredString(formData, 'name');
  if (!name) return { error: 'Name is required' };

  const response = await fetch(`${API_URL}/pipelines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create pipeline' }));
    return { error: data.message || 'Failed to create pipeline' };
  }

  redirect('/pipelines');
}

export async function transitionPipelineAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Pipeline ID is required' };

  const state = validateRequiredString(formData, 'state');
  if (!state) return { error: 'Target state is required' };

  const response = await fetch(`${API_URL}/pipelines/${id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to transition pipeline' }));
    return { error: data.message || 'Failed to transition pipeline' };
  }

  redirect('/pipelines');
}

// ── Widget Actions ──

export async function createWidgetAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const title = validateRequiredString(formData, 'title');
  if (!title) return { error: 'Title is required' };

  const type = validateRequiredString(formData, 'type');
  if (!type) return { error: 'Widget type is required' };

  const dashboardId = validateRequiredString(formData, 'dashboardId');
  if (!dashboardId) return { error: 'Dashboard ID is required' };

  const response = await fetch(`${API_URL}/widgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title, type, dashboardId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create widget' }));
    return { error: data.message || 'Failed to create widget' };
  }

  redirect('/widgets');
}

// ── Embed Actions ──

export async function createEmbedAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const dashboardId = validateRequiredString(formData, 'dashboardId');
  if (!dashboardId) return { error: 'Dashboard ID is required' };

  const expiresAt = validateRequiredString(formData, 'expiresAt');
  if (!expiresAt) return { error: 'Expiration date is required' };

  const response = await fetch(`${API_URL}/embeds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dashboardId, expiresAt }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create embed' }));
    return { error: data.message || 'Failed to create embed' };
  }

  redirect('/embeds');
}

export async function deleteEmbedAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  'use server';

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Embed ID is required' };

  const response = await fetch(`${API_URL}/embeds/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to delete embed' }));
    return { error: data.message || 'Failed to delete embed' };
  }

  redirect('/embeds');
}
