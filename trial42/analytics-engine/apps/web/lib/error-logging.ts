import { formatLogEntry, createCorrelationId } from '@analytics-engine/shared';

// TRACED:AE-UI-002
export function logErrorBoundary(
  error: Error,
  componentStack?: string,
): void {
  const correlationId = createCorrelationId();
  const entry = formatLogEntry('error', 'Error boundary caught error', {
    correlationId,
    errorMessage: error.message,
    componentStack: componentStack ?? 'unknown',
  });

  // Structured error logging to console in JSON format
  // eslint-disable-next-line no-console
  console.error(entry);
}
