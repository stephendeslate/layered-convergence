import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED:AE-UI-001
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
