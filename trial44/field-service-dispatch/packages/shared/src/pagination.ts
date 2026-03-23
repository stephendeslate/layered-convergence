// TRACED: FD-MAX-PAGE-SIZE
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// TRACED: FD-NORMALIZE-PAGE
export function normalizePageParams(
  page?: number,
  pageSize?: number,
): PaginationParams {
  const normalizedPage = Math.max(1, page ?? 1);
  const normalizedPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, pageSize ?? 20),
  );
  return { page: normalizedPage, pageSize: normalizedPageSize };
}
