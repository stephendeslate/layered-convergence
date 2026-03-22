// TRACED: EM-ACT-001
'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function loginAction(formData: FormData) {
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

  const data = await response.json();
  return { token: data.token, user: data.user };
}

export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;
  const tenantId = formData.get('tenantId') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role, tenantId }),
  });

  if (!response.ok) {
    return { error: 'Registration failed' };
  }

  const data = await response.json();
  return { token: data.token, user: data.user };
}

export async function fetchListingsAction() {
  const response = await fetch(`${API_URL}/listings`);
  if (!response.ok) {
    return { error: 'Failed to fetch listings' };
  }
  return response.json();
}
