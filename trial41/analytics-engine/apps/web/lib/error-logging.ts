// TRACED:AE-FRONTEND-ERROR-LOGGING
import { ERROR_CODES } from '@analytics-engine/shared';

export interface ErrorLogEntry {
  timestamp: string;
  level: 'error';
  code: string;
  message: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
}

export function logErrorBoundary(
  error: Error,
  errorInfo: { componentStack?: string },
): void {
  const entry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    code: ERROR_CODES.INTERNAL_ERROR,
    message: error.message,
    componentStack: errorInfo.componentStack ?? undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };

  // Structured error logging — in production this would POST to /errors
  console.error(JSON.stringify(entry));
}
