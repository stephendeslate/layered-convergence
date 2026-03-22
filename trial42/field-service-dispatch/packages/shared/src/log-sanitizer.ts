// TRACED: FD-LOG-SANITIZER
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
];

/**
 * T42 variation: Redacts sensitive fields from log context objects.
 * Performs deep sanitization on nested objects. Sensitive keys are
 * matched case-insensitively.
 */
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
