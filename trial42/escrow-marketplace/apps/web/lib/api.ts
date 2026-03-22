// TRACED: EM-API-001
import { DEFAULT_PAGE_SIZE, createCorrelationId } from '@escrow-marketplace/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const correlationId = createCorrelationId();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      ...options?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function buildPaginationParams(
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): string {
  return `?page=${page}&pageSize=${pageSize}`;
}
