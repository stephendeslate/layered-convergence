// TRACED: EM-UTIL-001
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MAX_PAGE_SIZE } from '@escrow-marketplace/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { MAX_PAGE_SIZE };
