// TRACED:AE-MON-010
const SENSITIVE_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'secret',
  'authorization',
];

const REDACTED = '[REDACTED]';

// TRACED:AE-MON-011
export function sanitizeLogContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.includes(lowerKey)) {
      result[key] = REDACTED;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeLogContext(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item !== null && typeof item === 'object') {
          return sanitizeLogContext(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }

  return result;
}
