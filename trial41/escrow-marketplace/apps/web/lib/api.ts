// TRACED:EM-UI-02 API client with error boundary logging
import { formatCurrency } from '@em/shared';
import { generateCorrelationId } from '@em/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const correlationId = generateCorrelationId();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export { formatCurrency };
