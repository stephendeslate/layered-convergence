// [TRACED:AC-019] Server Actions for all mutations with response.ok checks before redirect
// [TRACED:SEC-013] Every fetch() checks response.ok before proceeding

'use server';

import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData): Promise<{ error?: string; accessToken?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { error: 'Invalid credentials' };
  }

  const data = await response.json() as { accessToken: string };
  return { accessToken: data.accessToken };
}

export async function registerAction(formData: FormData): Promise<{ error?: string; accessToken?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  const tenantId = formData.get('tenantId') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, tenantId }),
  });

  if (!response.ok) {
    return { error: 'Registration failed' };
  }

  const data = await response.json() as { accessToken: string };
  return { accessToken: data.accessToken };
}

export async function createDashboardAction(
  token: string,
  name: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create dashboard');
  }

  redirect('/dashboard');
}

export async function createDataSourceAction(
  token: string,
  name: string,
  type: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/data-sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, type }),
  });

  if (!response.ok) {
    throw new Error('Failed to create data source');
  }

  redirect('/data-sources');
}

export async function createPipelineAction(
  token: string,
  name: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/pipelines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to create pipeline');
  }

  redirect('/pipelines');
}

export async function transitionPipelineAction(
  token: string,
  id: string,
  status: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/pipelines/${id}/transition`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to transition pipeline');
  }

  redirect('/pipelines');
}

export async function deleteDashboardAction(
  token: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/dashboards/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to delete dashboard');
  }

  redirect('/dashboard');
}
