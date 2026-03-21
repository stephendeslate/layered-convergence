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
    headers: { 'Content-Type': 'application/json' },
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

export async function createTransactionAction(formData: FormData, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sellerId: formData.get('sellerId'),
      amount: Number(formData.get('amount')),
      description: formData.get('description'),
      currency: formData.get('currency') || 'USD',
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create transaction' };
  }

  return { success: true };
}

export async function fileDisputeAction(formData: FormData, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/disputes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      transactionId: formData.get('transactionId'),
      reason: formData.get('reason'),
    }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to file dispute' };
  }

  return { success: true };
}

export async function transitionTransactionAction(id: string, status: string, token: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_URL}/transactions/${id}/transition`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to transition transaction' };
  }

  return { success: true };
}
