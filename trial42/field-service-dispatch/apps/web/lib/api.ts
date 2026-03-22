// TRACED: FD-API-CLIENT
import { createCorrelationId } from '@field-service-dispatch/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const correlationId = createCorrelationId();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
