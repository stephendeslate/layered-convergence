'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  apiLogin,
  apiRegister,
  createTransaction,
  updateTransactionStatus,
  createDispute,
  resolveDispute,
} from './api';
import {
  validateRequiredString,
  validateOptionalString,
  validateRequiredNumber,
} from './validation';
import type { ActionState } from './types';

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
      maxAge: 60 * 60 * 24,
      path: '/',
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Login failed',
      success: false,
    };
  }

  redirect('/transactions');
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const email = validateRequiredString(formData, 'email');
    const password = validateRequiredString(formData, 'password');
    const role = validateRequiredString(formData, 'role');

    if (role !== 'BUYER' && role !== 'SELLER') {
      return { error: 'Role must be BUYER or SELLER', success: false };
    }

    const response = await apiRegister(email, password, role);

    const cookieStore = await cookies();
    cookieStore.set('token', response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Registration failed',
      success: false,
    };
  }

  redirect('/transactions');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function createTransactionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const title = validateRequiredString(formData, 'title');
    const description = validateOptionalString(formData, 'description');
    const amount = validateRequiredNumber(formData, 'amount');
    const sellerId = validateRequiredString(formData, 'sellerId');

    await createTransaction({ title, description, amount, sellerId });
    revalidatePath('/transactions');
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create transaction',
      success: false,
    };
  }

  redirect('/transactions');
}

export async function updateStatusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const transactionId = validateRequiredString(formData, 'transactionId');
    const status = validateRequiredString(formData, 'status');

    await updateTransactionStatus(transactionId, status);
    revalidatePath(`/transactions/${transactionId}`);
    revalidatePath('/transactions');
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update status',
      success: false,
    };
  }

  return { error: null, success: true };
}

export async function createDisputeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const transactionId = validateRequiredString(formData, 'transactionId');
    const reason = validateRequiredString(formData, 'reason');

    await createDispute({ transactionId, reason });
    revalidatePath('/disputes');
    revalidatePath(`/transactions/${transactionId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to create dispute',
      success: false,
    };
  }

  redirect('/disputes');
}

export async function resolveDisputeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const disputeId = validateRequiredString(formData, 'disputeId');
    const resolution = validateRequiredString(formData, 'resolution');

    await resolveDispute(disputeId, resolution);
    revalidatePath('/disputes');
    revalidatePath(`/disputes/${disputeId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to resolve dispute',
      success: false,
    };
  }

  return { error: null, success: true };
}
