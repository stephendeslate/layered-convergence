// TRACED: EM-ELOG-001
import { formatLogEntry, createCorrelationId } from '@escrow-marketplace/shared';

export function logErrorBoundary(
  error: Error,
  componentStack?: string,
): void {
  const entry = formatLogEntry('error', 'Client error boundary triggered', {
    error: error.message,
    componentStack: componentStack ?? 'unknown',
    correlationId: createCorrelationId(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  });

  if (process.env.NEXT_PUBLIC_API_URL) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: entry,
    }).catch(() => {
      // Silently fail if error reporting endpoint is unavailable
    });
  }
}
