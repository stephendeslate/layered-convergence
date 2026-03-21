export const TECHNICIAN_STATUSES = {
  AVAILABLE: 'AVAILABLE',
  BUSY: 'BUSY',
  OFF_DUTY: 'OFF_DUTY',
} as const;

export type TechnicianStatus =
  (typeof TECHNICIAN_STATUSES)[keyof typeof TECHNICIAN_STATUSES];
