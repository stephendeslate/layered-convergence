export const SERVICE_TYPES = {
  HVAC: 'HVAC',
  PLUMBING: 'PLUMBING',
  ELECTRICAL: 'ELECTRICAL',
  GENERAL: 'GENERAL',
  APPLIANCE: 'APPLIANCE',
} as const;

export type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

export const VALID_SERVICE_TYPES = Object.values(SERVICE_TYPES);
