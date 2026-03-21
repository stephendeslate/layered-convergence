/**
 * Shared TypeScript types for the Analytics Engine platform.
 * Used by both apps/api and apps/web.
 */

export enum Role {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ANALYST = 'ANALYST',
}

export enum PipelineStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

export enum SyncRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface TenantDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSourceDto {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataPointDto {
  id: string;
  value: string;
  label: string;
  timestamp: string;
  dataSourceId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineDto {
  id: string;
  name: string;
  status: PipelineStatus;
  config: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardDto {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WidgetDto {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  dashboardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedDto {
  id: string;
  token: string;
  isActive: boolean;
  tenantId: string;
  dashboardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncRunDto {
  id: string;
  status: SyncRunStatus;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  dataSourceId: string;
  tenantId: string;
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
  tenantId: string;
}

export interface AuthResponse {
  accessToken: string;
}
