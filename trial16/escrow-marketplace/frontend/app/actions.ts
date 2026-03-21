'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  createTransaction as apiCreateTransaction,
  transitionTransaction as apiTransitionTransaction,
  createDispute as apiCreateDispute,
  resolveDispute as apiResolveDispute,
  loginUser,
  registerUser,
} from '@/lib/api';

function validateString(value: FormDataEntryValue | null, field: string): string {
  if (value === null || typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function validateNumber(value: FormDataEntryValue | null, field: string): number {
  if (value === null || typeof value !== 'string') {
    throw new Error(`${field} is required`);
  }
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) {
    throw new Error(`${field} must be a positive number`);
  }
  return num;
}

function validateEnum<T extends string>(
  value: FormDataEntryValue | null,
  field: string,
  allowedValues: readonly T[],
): T {
  if (value === null || typeof value !== 'string') {
    throw new Error(`${field} is required`);
  }
  if (!allowedValues.includes(value as T)) {
    throw new Error(`${field} must be one of: ${allowedValues.join(', ')}`);
  }
  return value as T;
}

export async function createTransaction(formData: FormData) {
  const title = validateString(formData.get('title'), 'Title');
  const amount = validateNumber(formData.get('amount'), 'Amount');
  const sellerId = validateString(formData.get('sellerId'), 'Seller ID');
  const descriptionRaw = formData.get('description');
  const description =
    descriptionRaw !== null && typeof descriptionRaw === 'string' && descriptionRaw.trim().length > 0
      ? descriptionRaw.trim()
      : undefined;

  await apiCreateTransaction({ title, description, amount, sellerId });

  revalidatePath('/');
  revalidatePath('/transactions');
}

export async function transitionTransaction(formData: FormData) {
  const transactionId = validateString(
    formData.get('transactionId'),
    'Transaction ID',
  );
  const VALID_STATUSES = [
    'PENDING',
    'FUNDED',
    'SHIPPED',
    'DELIVERED',
    'RELEASED',
    'CANCELLED',
    'DISPUTED',
    'RESOLVED',
    'REFUNDED',
  ] as const;
  const targetStatus = validateEnum(
    formData.get('targetStatus'),
    'Target Status',
    VALID_STATUSES,
  );

  await apiTransitionTransaction(transactionId, targetStatus);

  revalidatePath(`/transactions/${transactionId}`);
  revalidatePath('/transactions');
  revalidatePath('/');
}

export async function createDispute(formData: FormData) {
  const transactionId = validateString(
    formData.get('transactionId'),
    'Transaction ID',
  );
  const reason = validateString(formData.get('reason'), 'Reason');
  const evidenceRaw = formData.get('evidence');
  const evidence =
    evidenceRaw !== null && typeof evidenceRaw === 'string' && evidenceRaw.trim().length > 0
      ? evidenceRaw.trim()
      : undefined;

  await apiCreateDispute({ transactionId, reason, evidence });

  revalidatePath(`/transactions/${transactionId}`);
  revalidatePath('/transactions');
  revalidatePath('/disputes');
  revalidatePath('/');
}

export async function resolveDispute(formData: FormData) {
  const disputeId = validateString(formData.get('disputeId'), 'Dispute ID');
  const VALID_RESOLUTIONS = ['RELEASE', 'REFUND'] as const;
  const resolution = validateEnum(
    formData.get('resolution'),
    'Resolution',
    VALID_RESOLUTIONS,
  );

  await apiResolveDispute(disputeId, resolution);

  revalidatePath(`/disputes/${disputeId}`);
  revalidatePath('/disputes');
  revalidatePath('/transactions');
  revalidatePath('/');
}

export async function login(formData: FormData) {
  const email = validateString(formData.get('email'), 'Email');
  const password = validateString(formData.get('password'), 'Password');

  const result = await loginUser({ email, password });

  const cookieStore = await cookies();
  cookieStore.set('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  revalidatePath('/');
}

export async function register(formData: FormData) {
  const email = validateString(formData.get('email'), 'Email');
  const password = validateString(formData.get('password'), 'Password');
  const name = validateString(formData.get('name'), 'Name');
  const VALID_ROLES = ['BUYER', 'SELLER'] as const;
  const role = validateEnum(formData.get('role'), 'Role', VALID_ROLES);

  const result = await registerUser({ email, password, name, role });

  const cookieStore = await cookies();
  cookieStore.set('token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });

  revalidatePath('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  revalidatePath('/');
}
