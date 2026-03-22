// TRACED:EM-SEC-01 bcrypt salt rounds constant
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED:EM-SEC-02 allowed registration roles excluding ADMIN
export const ALLOWED_REGISTRATION_ROLES = ['BUYER', 'SELLER'] as const;

// TRACED:EM-PERF-01 pagination constants
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;
