import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: EM-FE-002 — cn() utility with clsx + tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
