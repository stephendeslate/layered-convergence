// TRACED: EM-LOGF-001
import { sanitizeLogContext } from './log-sanitizer';

// TRACED: EM-LOGF-002
export function formatLogEntry(
  level: string,
  message: string,
  context?: Record<string, unknown>,
): string {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  if (context) {
    entry.context = sanitizeLogContext(context);
  }
  return JSON.stringify(entry);
}
