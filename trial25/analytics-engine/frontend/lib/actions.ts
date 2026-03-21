'use server';

// [TRACED:UI-008] Server Actions with 'use server' directive — all check response.ok

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string; token?: string }> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  });

  // [TRACED:API-006] response.ok check before processing
  if (!response.ok) {
    return { success: false, error: 'Invalid credentials' };
  }

  const data = await response.json();
  return { success: true, token: data.accessToken };
}

export async function registerAction(formData: FormData): Promise<{ success: boolean; error?: string; token?: string }> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': formData.get('tenantId') as string,
    },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
      name: formData.get('name'),
      role: formData.get('role'),
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'Registration failed' };
  }

  const data = await response.json();
  return { success: true, token: data.accessToken };
}

export async function createDataSourceAction(formData: FormData, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/data-sources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: formData.get('name'),
      type: formData.get('type'),
      connectionUri: formData.get('connectionUri'),
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create data source' };
  }

  return { success: true };
}

export async function createPipelineAction(formData: FormData, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/pipelines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: formData.get('name'),
      description: formData.get('description'),
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create pipeline' };
  }

  return { success: true };
}

export async function createDashboardAction(formData: FormData, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/dashboards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: formData.get('title'),
      isPublic: formData.get('isPublic') === 'true',
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create dashboard' };
  }

  return { success: true };
}

export async function transitionPipelineAction(id: string, status: string, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/pipelines/${id}/transition`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to transition pipeline' };
  }

  return { success: true };
}
