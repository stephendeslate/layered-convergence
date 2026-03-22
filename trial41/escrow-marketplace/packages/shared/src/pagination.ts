// TRACED:EM-PERF-02 pagination normalization with MAX_PAGE_SIZE clamping
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

export function normalizePageParams(
  page?: number,
  pageSize?: number,
): PaginationParams {
  const normalizedPage = Math.max(1, page ?? 1);
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, pageSize ?? DEFAULT_PAGE_SIZE),
  );
  return { page: normalizedPage, pageSize: normalizedPageSize };
}
