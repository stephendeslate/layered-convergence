/**
 * Shared TypeScript types for the Field Service Dispatch platform.
 */

export enum Role {
  ADMIN = 'ADMIN',
  DISPATCHER = 'DISPATCHER',
  TECHNICIAN = 'TECHNICIAN',
  MANAGER = 'MANAGER',
}

export enum WorkOrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CompanyDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianDto {
  id: string;
  name: string;
  specialty: string;
  isAvailable: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderDto {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: Priority;
  customerId: string;
  technicianId: string | null;
  scheduledAt: string | null;
  completedAt: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteDto {
  id: string;
  name: string;
  date: string;
  technicianId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GpsEventDto {
  id: string;
  latitude: string;
  longitude: string;
  timestamp: string;
  technicianId: string;
  companyId: string;
}

export interface InvoiceDto {
  id: string;
  amount: string;
  currency: string;
  workOrderId: string;
  customerId: string;
  companyId: string;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: Role;
  companyId: string;
}

export interface AuthResponse {
  accessToken: string;
}
