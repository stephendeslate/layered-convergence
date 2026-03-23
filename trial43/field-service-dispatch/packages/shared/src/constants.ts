// TRACED: FD-BCRYPT-SALT
export const BCRYPT_SALT_ROUNDS = 12;

// TRACED: FD-ALLOWED-ROLES
export const ALLOWED_REGISTRATION_ROLES = ['USER', 'TECHNICIAN', 'DISPATCHER'] as const;

export const WORK_ORDER_STATUSES = [
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'FAILED',
] as const;

export const TECHNICIAN_STATUSES = [
  'AVAILABLE',
  'ON_ASSIGNMENT',
  'OFF_DUTY',
  'SUSPENDED',
] as const;

export const SCHEDULE_STATUSES = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export const PRIORITY_VALUES = [1, 2, 3, 4, 5] as const;

// TRACED: FD-APP-VERSION
export const APP_VERSION = '1.0.0';
