// TRACED:AE-CN-UTILITY
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MAX_PAGE_SIZE } from '@analytics-engine/shared';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// TRACED:AE-WEB-PAGINATION-DEFAULTS
export const WEB_MAX_PAGE_SIZE = MAX_PAGE_SIZE;
