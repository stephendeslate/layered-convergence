'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateRequiredString, validateRequiredNumber } from '@/lib/validation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// --- Auth Actions ---

// [TRACED:UI-008] Server Actions check response.ok before redirect
export async function loginAction(prevState: unknown, formData: FormData) {
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
    const data = await response.json().catch(() => ({ message: 'Invalid credentials' }));
    return { error: data.message || 'Invalid credentials' };
  }

  const data = await response.json();
  const cookieStore = await cookies();

  cookieStore.set('token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  cookieStore.set('user', JSON.stringify(data.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  redirect('/dashboard');
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const email = validateRequiredString(formData, 'email');
  if (!email) return { error: 'Email is required' };

  const password = validateRequiredString(formData, 'password');
  if (!password) return { error: 'Password is required' };

  const role = validateRequiredString(formData, 'role');
  if (!role) return { error: 'Role is required' };

  const companySlug = validateRequiredString(formData, 'companySlug');
  if (!companySlug) return { error: 'Company slug is required' };

  const companyName = validateRequiredString(formData, 'companyName');

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, companySlug, companyName }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Registration failed' }));
    return { error: data.message || 'Registration failed' };
  }

  const data = await response.json();
  const cookieStore = await cookies();

  cookieStore.set('token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  cookieStore.set('user', JSON.stringify(data.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
  redirect('/login');
}

// --- Customer Actions ---

export async function createCustomerAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const name = validateRequiredString(formData, 'name');
  if (!name) return { error: 'Name is required' };

  const email = validateRequiredString(formData, 'email');
  if (!email) return { error: 'Email is required' };

  const phone = validateRequiredString(formData, 'phone');
  if (!phone) return { error: 'Phone is required' };

  const address = validateRequiredString(formData, 'address');
  if (!address) return { error: 'Address is required' };

  const response = await fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, email, phone, address }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create customer' }));
    return { error: data.message || 'Failed to create customer' };
  }

  redirect('/customers');
}

export async function deleteCustomerAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Customer ID is required' };

  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to delete customer' }));
    return { error: data.message || 'Failed to delete customer' };
  }

  redirect('/customers');
}

// --- Work Order Actions ---

export async function createWorkOrderAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const title = validateRequiredString(formData, 'title');
  if (!title) return { error: 'Title is required' };

  const description = validateRequiredString(formData, 'description');
  if (!description) return { error: 'Description is required' };

  const customerId = validateRequiredString(formData, 'customerId');
  if (!customerId) return { error: 'Customer is required' };

  const priority = validateRequiredNumber(formData, 'priority');
  const technicianId = validateRequiredString(formData, 'technicianId');
  const scheduledAt = validateRequiredString(formData, 'scheduledAt');

  const response = await fetch(`${API_URL}/work-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      title,
      description,
      customerId,
      priority: priority || 3,
      technicianId: technicianId || undefined,
      scheduledAt: scheduledAt || undefined,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create work order' }));
    return { error: data.message || 'Failed to create work order' };
  }

  redirect('/work-orders');
}

export async function transitionWorkOrderAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Work order ID is required' };

  const status = validateRequiredString(formData, 'status');
  if (!status) return { error: 'Status is required' };

  const technicianId = validateRequiredString(formData, 'technicianId');

  const response = await fetch(`${API_URL}/work-orders/${id}/transition`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      status,
      technicianId: technicianId || undefined,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to update work order status' }));
    return { error: data.message || 'Failed to update work order status' };
  }

  redirect('/work-orders');
}

export async function deleteWorkOrderAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Work order ID is required' };

  const response = await fetch(`${API_URL}/work-orders/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to delete work order' }));
    return { error: data.message || 'Failed to delete work order' };
  }

  redirect('/work-orders');
}

// --- Technician Actions ---

export async function createTechnicianAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const userId = validateRequiredString(formData, 'userId');
  if (!userId) return { error: 'User ID is required' };

  const skillsRaw = validateRequiredString(formData, 'skills');
  if (!skillsRaw) return { error: 'Skills are required' };

  const skills = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);
  const availability = validateRequiredString(formData, 'availability') || 'AVAILABLE';

  const response = await fetch(`${API_URL}/technicians`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, skills, availability }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create technician' }));
    return { error: data.message || 'Failed to create technician' };
  }

  redirect('/technicians');
}

// --- Invoice Actions ---

export async function createInvoiceAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const workOrderId = validateRequiredString(formData, 'workOrderId');
  if (!workOrderId) return { error: 'Work order is required' };

  const amount = validateRequiredNumber(formData, 'amount');
  if (amount === null) return { error: 'Amount is required' };

  const tax = validateRequiredNumber(formData, 'tax');
  if (tax === null) return { error: 'Tax is required' };

  const response = await fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ workOrderId, amount, tax }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create invoice' }));
    return { error: data.message || 'Failed to create invoice' };
  }

  redirect('/invoices');
}

export async function updateInvoiceStatusAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const id = validateRequiredString(formData, 'id');
  if (!id) return { error: 'Invoice ID is required' };

  const status = validateRequiredString(formData, 'status');
  if (!status) return { error: 'Status is required' };

  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to update invoice' }));
    return { error: data.message || 'Failed to update invoice' };
  }

  redirect('/invoices');
}

// --- Route Actions ---

export async function createRouteAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const technicianId = validateRequiredString(formData, 'technicianId');
  if (!technicianId) return { error: 'Technician is required' };

  const workOrderId = validateRequiredString(formData, 'workOrderId');
  if (!workOrderId) return { error: 'Work order is required' };

  const distance = validateRequiredNumber(formData, 'distance');
  if (distance === null) return { error: 'Distance is required' };

  const estimatedMinutes = validateRequiredNumber(formData, 'estimatedMinutes');
  if (estimatedMinutes === null) return { error: 'Estimated minutes is required' };

  const response = await fetch(`${API_URL}/routes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ technicianId, workOrderId, distance, estimatedMinutes: Math.round(estimatedMinutes) }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create route' }));
    return { error: data.message || 'Failed to create route' };
  }

  redirect('/routes');
}

// --- GPS Event Actions ---

export async function createGpsEventAction(prevState: unknown, formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { error: 'Not authenticated' };

  const technicianId = validateRequiredString(formData, 'technicianId');
  if (!technicianId) return { error: 'Technician is required' };

  const lat = validateRequiredNumber(formData, 'lat');
  if (lat === null) return { error: 'Latitude is required' };

  const lng = validateRequiredNumber(formData, 'lng');
  if (lng === null) return { error: 'Longitude is required' };

  const response = await fetch(`${API_URL}/gps-events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ technicianId, lat, lng }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Failed to create GPS event' }));
    return { error: data.message || 'Failed to create GPS event' };
  }

  return { success: true };
}
