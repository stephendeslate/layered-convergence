// GPS
export const GPS_UPDATE_INTERVAL_MS = 10_000; // 10 seconds
export const GPS_RETENTION_DAYS = 90;

// Route cache
export const ROUTE_CACHE_TTL_SECONDS = 3600; // 1 hour

// Service types grouped by category
export const SERVICE_TYPE_CATEGORIES = {
  HVAC: ['HVAC_INSTALL', 'HVAC_REPAIR', 'HVAC_MAINTENANCE'],
  PLUMBING: ['PLUMBING_REPAIR', 'PLUMBING_INSTALL'],
  ELECTRICAL: ['ELECTRICAL_REPAIR', 'ELECTRICAL_INSTALL'],
  OTHER: ['GENERAL_MAINTENANCE', 'CLEANING', 'PEST_CONTROL', 'LANDSCAPING', 'APPLIANCE_REPAIR', 'OTHER'],
} as const;

// Work order reference number prefix
export const WORK_ORDER_PREFIX = 'WO';
export const INVOICE_PREFIX = 'INV';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Tracking token expiry
export const TRACKING_TOKEN_EXPIRY_HOURS = 24;

// WebSocket namespaces
export const WS_NAMESPACE_GPS = '/gps';
export const WS_NAMESPACE_DISPATCH = '/dispatch';
export const WS_NAMESPACE_TRACKING = '/tracking';

// WebSocket events
export const WS_EVENTS = {
  GPS_UPDATE: 'gps:update',
  GPS_POSITION: 'gps:position',
  GPS_SUBSCRIBE: 'gps:subscribe',
  DISPATCH_UPDATE: 'dispatch:update',
  TRACKING_POSITION: 'tracking:position',
} as const;

// Redis key prefixes
export const REDIS_KEYS = {
  GPS_POSITIONS: 'gps',
  ROUTE_CACHE: 'route:directions',
  SESSION: 'session',
} as const;
