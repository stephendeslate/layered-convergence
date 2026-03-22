// TRACED: FD-ERROR-BOUNDARY-LOGGING
import { normalizePageParams } from '@field-service-dispatch/shared';

export function logErrorToApi(error: Error, componentStack?: string): void {
  const errorPayload = {
    message: error.message,
    stack: error.stack,
    componentStack,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };

  // Structured console.error as fallback
  console.error(JSON.stringify(errorPayload));

  // Attempt to POST to the API error endpoint
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  fetch(`${apiUrl}/errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(errorPayload),
  }).catch(() => {
    // Silently fail — already logged to console
  });
}

// Re-export for use by pages that need pagination defaults
export { normalizePageParams };
