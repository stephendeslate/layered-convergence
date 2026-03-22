import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: EM-FE-005 — cn() utility on all UI components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
