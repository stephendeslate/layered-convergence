// [TRACED:AE-UI-006] Server actions with 'use server' directive and response.ok check
'use server';

import { redirect } from 'next/navigation';
import type { PipelineDto, DataSourceDto } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  redirect('/dashboard');
}

export async function registerAction(formData: FormData): Promise<void> {
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
    throw new Error('Registration failed');
  }

  redirect('/login');
}

export async function fetchPipelines(): Promise<PipelineDto[]> {
  const response = await fetch(`${API_URL}/pipelines`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pipelines');
  }

  return response.json() as Promise<PipelineDto[]>;
}

export async function fetchDataSources(): Promise<DataSourceDto[]> {
  const response = await fetch(`${API_URL}/data-sources`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch data sources');
  }

  return response.json() as Promise<DataSourceDto[]>;
}
