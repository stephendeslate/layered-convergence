// TRACED: FD-LOG-FORMAT
import { sanitizeLogContext } from './log-sanitizer';

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
    Object.assign(entry, sanitizeLogContext(context));
  }
  return JSON.stringify(entry);
}
