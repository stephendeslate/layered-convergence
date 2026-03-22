import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MAX_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED:AE-UI-001
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { MAX_PAGE_SIZE };
