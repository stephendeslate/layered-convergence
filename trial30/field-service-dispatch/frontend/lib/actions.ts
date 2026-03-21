'use server';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';

export async function loginAction(
  formData: FormData,
): Promise<{ error?: string; token?: string }> {
  const email = formData.get('email');
  const password = formData.get('password');

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return { error: body.message ?? 'Login failed' };
  }

  const data = await response.json();
  return { token: data.access_token };
}

export async function registerAction(
  formData: FormData,
): Promise<{ error?: string; token?: string }> {
  const email = formData.get('email');
  const password = formData.get('password');
  const role = formData.get('role');

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    return { error: body.message ?? 'Registration failed' };
  }

  const data = await response.json();
  return { token: data.access_token };
}
