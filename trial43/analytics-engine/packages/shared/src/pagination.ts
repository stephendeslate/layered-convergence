import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

// TRACED:AE-PERF-002
export function clampPageSize(requested: number | undefined): number {
  const size = requested ?? DEFAULT_PAGE_SIZE;
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export function calculateSkip(page: number | undefined, pageSize: number): number {
  const p = page && page > 0 ? page : 1;
  return (p - 1) * pageSize;
}
