'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as api from '@/lib/api';
import type { ActionState } from '@/lib/types';

export async function loginAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const result = await api.login(email, password);
    const cookieStore = await cookies();
    cookieStore.set('token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    return { success: true, data: result.user };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Login failed' };
  }
}

export async function registerAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !name || !role) {
    return { error: 'All fields are required' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  try {
    const result = await api.register(email, password, name, role);
    const cookieStore = await cookies();
    cookieStore.set('token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return { success: true, data: result.user };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Registration failed' };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function createTransactionAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = formData.get('title') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const sellerId = formData.get('sellerId') as string;
  const description = formData.get('description') as string;

  if (!title || !amount || !sellerId) {
    return { error: 'Title, amount, and seller ID are required' };
  }

  if (isNaN(amount) || amount <= 0) {
    return { error: 'Amount must be a positive number' };
  }

  try {
    const txn = await api.createTransaction({
      title,
      amount,
      sellerId,
      description: description || undefined,
    });
    revalidatePath('/transactions');
    return { success: true, data: txn };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create transaction' };
  }
}

export async function transitionTransactionAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const transactionId = formData.get('transactionId') as string;
  const action = formData.get('action') as string;

  if (!transactionId || !action) {
    return { error: 'Transaction ID and action are required' };
  }

  try {
    const txn = await api.transitionTransaction(transactionId, action);
    revalidatePath(`/transactions/${transactionId}`);
    revalidatePath('/transactions');
    return { success: true, data: txn };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Transition failed' };
  }
}

export async function createDisputeAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const transactionId = formData.get('transactionId') as string;
  const reason = formData.get('reason') as string;
  const evidence = formData.get('evidence') as string;

  if (!transactionId || !reason) {
    return { error: 'Transaction ID and reason are required' };
  }

  try {
    const dispute = await api.createDispute({
      transactionId,
      reason,
      evidence: evidence || undefined,
    });
    revalidatePath('/disputes');
    revalidatePath(`/transactions/${transactionId}`);
    return { success: true, data: dispute };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create dispute' };
  }
}

export async function resolveDisputeAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const disputeId = formData.get('disputeId') as string;
  const resolution = formData.get('resolution') as string;

  if (!disputeId || !resolution) {
    return { error: 'Dispute ID and resolution are required' };
  }

  try {
    const dispute = await api.resolveDispute(disputeId, resolution);
    revalidatePath('/disputes');
    revalidatePath(`/disputes/${disputeId}`);
    return { success: true, data: dispute };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to resolve dispute' };
  }
}
