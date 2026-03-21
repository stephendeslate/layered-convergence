'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('Not authenticated');
  return token;
}

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const companyId = formData.get('companyId');

  if (typeof email !== 'string' || typeof password !== 'string' || typeof companyId !== 'string') {
    return { error: 'All fields are required' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, companyId }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Login failed' }));
      return { error: error.message || 'Invalid credentials' };
    }

    const data = await res.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return { success: true };
  } catch {
    return { error: 'An error occurred during login' };
  }
}

export async function registerAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');
  const companyName = formData.get('companyName');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof name !== 'string' ||
    typeof companyName !== 'string'
  ) {
    return { error: 'All fields are required' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, companyName }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Registration failed' }));
      return { error: error.message || 'Registration failed' };
    }

    const data = await res.json();
    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return { success: true };
  } catch {
    return { error: 'An error occurred during registration' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function createWorkOrderAction(_prevState: unknown, formData: FormData) {
  const token = await getToken();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = formData.get('priority') as string;
  const technicianId = formData.get('technicianId') as string;
  const customerId = formData.get('customerId') as string;
  const scheduledAt = formData.get('scheduledAt') as string;

  try {
    const res = await fetch(`${API_URL}/work-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description: description || undefined,
        priority: priority || undefined,
        technicianId: technicianId || undefined,
        customerId: customerId || undefined,
        scheduledAt: scheduledAt || undefined,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to create work order' }));
      return { error: error.message };
    }

    revalidatePath('/work-orders');
    return { success: true };
  } catch {
    return { error: 'An error occurred' };
  }
}

export async function transitionWorkOrderAction(workOrderId: string, status: string) {
  const token = await getToken();

  const res = await fetch(`${API_URL}/work-orders/${workOrderId}/transition`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Transition failed' }));
    throw new Error(error.message);
  }

  revalidatePath(`/work-orders/${workOrderId}`);
  revalidatePath('/work-orders');
  return res.json();
}

export async function assignTechnicianAction(workOrderId: string, technicianId: string) {
  const token = await getToken();

  const res = await fetch(`${API_URL}/work-orders/${workOrderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ technicianId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Assignment failed' }));
    throw new Error(error.message);
  }

  revalidatePath(`/work-orders/${workOrderId}`);
  revalidatePath('/work-orders');
  return res.json();
}

export async function createRouteAction(_prevState: unknown, formData: FormData) {
  const token = await getToken();
  const name = formData.get('name') as string;
  const date = formData.get('date') as string;
  const technicianId = formData.get('technicianId') as string;

  try {
    const res = await fetch(`${API_URL}/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        date,
        technicianId: technicianId || undefined,
      }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Failed to create route' }));
      return { error: error.message };
    }

    revalidatePath('/routes');
    return { success: true };
  } catch {
    return { error: 'An error occurred' };
  }
}
