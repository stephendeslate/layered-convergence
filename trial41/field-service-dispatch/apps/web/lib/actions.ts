'use server';

// TRACED: FD-SERVER-ACTIONS
import { APP_VERSION } from '@field-service-dispatch/shared';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function fetchApi(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getWorkOrders(token: string) {
  return fetchApi('/work-orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getTechnicians(token: string) {
  return fetchApi('/technicians', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getSchedules(token: string) {
  return fetchApi('/schedules', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getServiceAreas(token: string) {
  return fetchApi('/service-areas', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function login(email: string, password: string) {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getAppVersion() {
  return APP_VERSION;
}

export async function reportError(error: { message: string; componentStack?: string }) {
  try {
    const response = await fetch(`${API_URL}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
    if (!response.ok) {
      throw new Error('Failed to report error');
    }
  } catch {
    // Fallback: structured console.error
    console.error(JSON.stringify({
      level: 'error',
      message: error.message,
      componentStack: error.componentStack,
      timestamp: new Date().toISOString(),
    }));
  }
}
