// TRACED:AE-UI-002
import { createCorrelationId } from '@analytics-engine/shared';

export function logClientError(error: Error, context?: Record<string, unknown>) {
  const correlationId = createCorrelationId();
  const payload = {
    message: error.message,
    name: error.name,
    correlationId,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (process.env.NODE_ENV === 'production') {
    void fetch('/api/client-errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Swallow fetch errors to avoid infinite loops
    });
  } else {
    // eslint-disable-next-line no-console
    console.error('[client-error]', payload);
  }
}
