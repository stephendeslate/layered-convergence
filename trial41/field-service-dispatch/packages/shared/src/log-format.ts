// TRACED: FD-LOG-FORMAT
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
    Object.assign(entry, context);
  }
  return JSON.stringify(entry);
}
