// TRACED: FD-FRONTEND-ERROR-LOGGING
import { formatLogEntry } from '@field-service-dispatch/shared';

export function logFrontendError(
  error: Error,
  componentStack?: string,
): void {
  const entry = formatLogEntry('error', error.message, {
    stack: error.stack,
    componentStack,
    source: 'frontend',
  });

  if (typeof window !== 'undefined') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    fetch(`${apiUrl}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack,
      }),
    }).catch(() => {
      // Silently fail if error reporting endpoint is unavailable
    });
  }

  // Also log structured entry to console for dev
  if (process.env.NODE_ENV === 'development') {
    // Using console.error for frontend only (API uses Pino)
    console.error(entry);
  }
}
