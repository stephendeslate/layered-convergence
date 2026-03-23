// TRACED: EM-CONST-001
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: EM-CONST-002
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 20;

// TRACED: EM-CONST-004
export const APP_VERSION = '1.0.0';

// TRACED: EM-CONST-003
export const ALLOWED_REGISTRATION_ROLES = ['BUYER', 'SELLER'] as const;
export type RegistrationRole = (typeof ALLOWED_REGISTRATION_ROLES)[number];
