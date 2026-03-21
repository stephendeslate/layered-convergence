import type {
  WorkOrderStatus,
  TechnicianStatus,
  Priority,
  InvoiceStatus,
  ServiceType,
  UserRole,
  NotificationChannel,
  NotificationType,
  LineItemType,
} from './enums';

// ============================================================
// Auth Types
// ============================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string; // userId
  companyId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

// ============================================================
// Entity Types (API response shapes)
// ============================================================

export interface CompanyDto {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  logoUrl: string | null;
  website: string | null;
  taxRate: number;
  timezone: string;
  createdAt: string;
}

export interface UserDto {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface TechnicianDto {
  id: string;
  companyId: string;
  userId: string;
  user: Pick<UserDto, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatarUrl'>;
  status: TechnicianStatus;
  skills: ServiceType[];
  maxJobsPerDay: number;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastPositionAt: string | null;
  vehicleInfo: string | null;
  color: string;
  simulationMode: boolean;
  createdAt: string;
}

export interface CustomerDto {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
}

export interface WorkOrderDto {
  id: string;
  companyId: string;
  customerId: string;
  technicianId: string | null;
  referenceNumber: string;
  status: WorkOrderStatus;
  priority: Priority;
  serviceType: ServiceType;
  description: string | null;
  notes: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  scheduledStart: string;
  scheduledEnd: string;
  estimatedMinutes: number;
  actualStart: string | null;
  actualEnd: string | null;
  trackingToken: string | null;
  customer?: CustomerDto;
  technician?: TechnicianDto;
  createdAt: string;
  updatedAt: string;
}

export interface LineItemDto {
  id: string;
  type: LineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sortOrder: number;
}

export interface InvoiceDto {
  id: string;
  companyId: string;
  customerId: string;
  workOrderId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  stripePaymentUrl: string | null;
  paidAt: string | null;
  sentAt: string | null;
  dueDate: string | null;
  notes: string | null;
  lineItems: LineItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface JobPhotoDto {
  id: string;
  workOrderId: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  createdAt: string;
}

export interface RouteDto {
  id: string;
  companyId: string;
  technicianId: string;
  date: string;
  optimized: boolean;
  totalDistanceMeters: number | null;
  totalDurationSeconds: number | null;
  stops: RouteStopDto[];
}

export interface RouteStopDto {
  id: string;
  routeId: string;
  workOrderId: string;
  sortOrder: number;
  estimatedArrival: string | null;
  estimatedDeparture: string | null;
  distanceFromPrevMeters: number | null;
  durationFromPrevSeconds: number | null;
  workOrder?: WorkOrderDto;
}

// ============================================================
// GPS Types
// ============================================================

export interface GpsPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  timestamp: string;
}

export interface GpsUpdate extends GpsPosition {
  technicianId: string;
}

export interface TrackingPosition {
  latitude: number;
  longitude: number;
  eta: number; // minutes
  distance: number; // meters
}

// ============================================================
// Dispatch Board Types
// ============================================================

export interface DispatchBoardData {
  date: string;
  unassigned: WorkOrderDto[];
  technicians: (TechnicianDto & {
    workOrders: WorkOrderDto[];
    route: RouteDto | null;
  })[];
}

export interface MapMarker {
  id: string;
  type: 'technician' | 'workorder';
  latitude: number;
  longitude: number;
  label: string;
  color: string;
  status: string;
  metadata?: Record<string, unknown>;
}

// ============================================================
// Analytics Types
// ============================================================

export interface AnalyticsOverview {
  totalWorkOrders: number;
  completedToday: number;
  activeWorkOrders: number;
  techniciansOnDuty: number;
  averageCompletionMinutes: number;
  revenueToday: number;
  revenueThisMonth: number;
}

// ============================================================
// Pagination
// ============================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================
// Route Optimization Types
// ============================================================

export interface RouteOptimizationRequest {
  technicianId: string;
  date: string;
  includeReturn?: boolean;
}

export interface RouteOptimizationResponse {
  route: RouteDto;
  optimized: boolean;
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  savings?: {
    distanceMeters: number;
    durationSeconds: number;
  };
}

export interface DirectionsRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface DirectionsResponse {
  distanceMeters: number;
  durationSeconds: number;
  geometry: any;
  steps: Array<{
    distanceMeters: number;
    durationSeconds: number;
    instruction: string;
  }>;
}

// ============================================================
// Notification Types
// ============================================================

export interface NotificationDto {
  id: string;
  companyId: string;
  workOrderId: string | null;
  recipientType: string;
  recipientId: string;
  channel: string;
  type: string;
  subject: string | null;
  body: string;
  sentAt: string | null;
  createdAt: string;
}

// ============================================================
// Audit Log Types
// ============================================================

export interface AuditLogDto {
  id: string;
  companyId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any> | null;
  createdAt: string;
}
