// TRACED: EM-PAGE-001
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from './constants';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// TRACED: EM-PAGE-002
export function clampPageSize(requested: number | undefined): number {
  const size = requested ?? DEFAULT_PAGE_SIZE;
  if (size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(size, MAX_PAGE_SIZE);
}

export function paginationToSkipTake(params: PaginationParams): {
  skip: number;
  take: number;
} {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}
