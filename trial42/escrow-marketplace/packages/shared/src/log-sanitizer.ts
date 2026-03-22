// TRACED: EM-LSAN-001
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
];

// TRACED: EM-LSAN-002
export function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      sanitized[key] = sanitizeLogContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
