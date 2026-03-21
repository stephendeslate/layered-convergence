import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates that a form field is a non-empty string.
 * Avoids `formData.get() as string` (FM #23).
 */
export function validateRequiredString(
  formData: FormData,
  field: string,
): string | null {
  const value = formData.get(field);
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  return value.trim();
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
