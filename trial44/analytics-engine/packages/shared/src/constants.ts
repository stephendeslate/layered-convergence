// TRACED:AE-SEC-001
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:AE-SEC-002
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'VIEWER', 'EDITOR'] as const;

// TRACED:AE-PERF-001
export const MAX_PAGE_SIZE = 100;

export const DEFAULT_PAGE_SIZE = 20;

// TRACED:AE-CROSS-001
export const APP_VERSION = process.env.APP_VERSION ?? '1.0.0';
