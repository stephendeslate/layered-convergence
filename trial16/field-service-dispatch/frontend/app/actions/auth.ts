'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AuthActionResult {
  error?: string;
  success?: boolean;
}

function validateString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = validateString(formData, 'email');
  if (!email) {
    return { error: 'Email is required' };
  }

  const password = validateString(formData, 'password');
  if (!password) {
    return { error: 'Password is required' };
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Login failed' }));
      return { error: data.message ?? 'Login failed' };
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  } catch {
    return { error: 'An unexpected error occurred' };
  }

  redirect('/');
}

export async function registerAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const name = validateString(formData, 'name');
  if (!name) {
    return { error: 'Name is required' };
  }

  const email = validateString(formData, 'email');
  if (!email) {
    return { error: 'Email is required' };
  }

  const password = validateString(formData, 'password');
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  const companyName = validateString(formData, 'companyName');
  if (!companyName) {
    return { error: 'Company name is required' };
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, companyName }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Registration failed' }));
      return { error: data.message ?? 'Registration failed' };
    }

    const data = await response.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  } catch {
    return { error: 'An unexpected error occurred' };
  }

  redirect('/');
}
