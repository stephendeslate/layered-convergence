import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: FD-UI-CN-001 — cn() utility for className merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
