'use server';

// [TRACED:UI-008] Server Actions for auth and entity operations

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return { success: false, error: 'Invalid credentials' };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, error: errorData.message ?? 'Registration failed' };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function createTransactionAction(formData: FormData, token: string): Promise<ActionResult> {
  const amount = parseFloat(formData.get('amount') as string);
  const description = formData.get('description') as string;
  const sellerId = formData.get('sellerId') as string;

  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, description, sellerId }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create transaction' };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function updateTransactionStatusAction(
  transactionId: string,
  status: string,
  token: string,
): Promise<ActionResult> {
  const response = await fetch(`${API_URL}/transactions/${transactionId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to update transaction status' };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function createDisputeAction(formData: FormData, token: string): Promise<ActionResult> {
  const reason = formData.get('reason') as string;
  const transactionId = formData.get('transactionId') as string;

  const response = await fetch(`${API_URL}/disputes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason, transactionId }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to create dispute' };
  }

  const data = await response.json();
  return { success: true, data };
}

export async function requestPayoutAction(formData: FormData, token: string): Promise<ActionResult> {
  const amount = parseFloat(formData.get('amount') as string);
  const transactionId = formData.get('transactionId') as string;

  const response = await fetch(`${API_URL}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount, transactionId }),
  });

  if (!response.ok) {
    return { success: false, error: 'Failed to request payout' };
  }

  const data = await response.json();
  return { success: true, data };
}
