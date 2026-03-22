// TRACED: UI-UTIL-001 — cn() utility for class merging
// TRACED: FD-UI-UTIL-001 — cn() utility for class merging
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
