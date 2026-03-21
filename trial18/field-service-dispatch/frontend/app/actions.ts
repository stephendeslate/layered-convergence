'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiLogin, apiRegister } from '@/lib/api';
import { validateRequiredString } from '@/lib/utils';
import type { ActionState } from '@/lib/types';

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const email = validateRequiredString(formData, 'email');
    const password = validateRequiredString(formData, 'password');

    const response = await apiLogin(email, password);

    const cookieStore = await cookies();
    cookieStore.set('token', response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    cookieStore.set('user', JSON.stringify(response.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { error: message };
  }

  redirect('/work-orders');
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const email = validateRequiredString(formData, 'email');
    const password = validateRequiredString(formData, 'password');
    const name = validateRequiredString(formData, 'name');
    const role = validateRequiredString(formData, 'role');
    const companyName = validateRequiredString(formData, 'companyName');

    const allowedRoles = ['DISPATCHER', 'TECHNICIAN'];
    if (!allowedRoles.includes(role)) {
      return { error: 'Invalid role. Must be DISPATCHER or TECHNICIAN.' };
    }

    const response = await apiRegister(email, password, name, role, companyName);

    const cookieStore = await cookies();
    cookieStore.set('token', response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
    cookieStore.set('user', JSON.stringify(response.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    return { error: message };
  }

  redirect('/work-orders');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
  redirect('/login');
}

export async function createWorkOrderAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const title = validateRequiredString(formData, 'title');
    const description = validateRequiredString(formData, 'description');
    const customerId = validateRequiredString(formData, 'customerId');
    const priorityStr = validateRequiredString(formData, 'priority');
    const priority = parseInt(priorityStr, 10);

    if (isNaN(priority) || priority < 1 || priority > 5) {
      return { error: 'Priority must be between 1 and 5' };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const API_URL = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${API_URL}/work-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, customerId, priority }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Failed to create work order' }));
      return { error: body.message ?? 'Failed to create work order' };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create work order';
    return { error: message };
  }

  redirect('/work-orders');
}

export async function transitionWorkOrderAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const workOrderId = validateRequiredString(formData, 'workOrderId');
    const status = validateRequiredString(formData, 'status');

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return { error: 'Not authenticated' };
    }

    const API_URL = process.env.API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${API_URL}/work-orders/${workOrderId}/transition`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Failed to transition work order' }));
      return { error: body.message ?? 'Failed to transition work order' };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to transition work order';
    return { error: message };
  }
}
