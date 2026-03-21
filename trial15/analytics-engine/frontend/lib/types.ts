export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  tenantId: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  config: Record<string, string>;
  status: DataSourceStatus;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DataSourceType = "postgresql" | "mysql" | "csv" | "api" | "snowflake" | "bigquery";

export type DataSourceStatus = "connected" | "disconnected" | "syncing" | "error";

export interface DataSourceCreatePayload {
  name: string;
  type: DataSourceType;
  config: Record<string, string>;
}

export interface DataPoint {
  id: string;
  dataSourceId: string;
  key: string;
  value: number;
  dimensions: Record<string, string>;
  timestamp: string;
}

export interface DataPointQuery {
  dataSourceId?: string;
  key?: string;
  startDate?: string;
  endDate?: string;
  dimensions?: Record<string, string>;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  dataSourceId: string;
  schedule: string | null;
  status: PipelineStatus;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PipelineStatus = "idle" | "running" | "completed" | "failed" | "cancelled";

export interface PipelineStatusEvent {
  pipelineId: string;
  status: PipelineStatus;
  progress: number;
  message: string;
  timestamp: string;
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardCreatePayload {
  name: string;
  description: string;
}

export interface Widget {
  id: string;
  dashboardId: string;
  title: string;
  type: WidgetType;
  config: WidgetConfig;
  position: WidgetPosition;
  createdAt: string;
  updatedAt: string;
}

export type WidgetType = "line-chart" | "bar-chart" | "pie-chart" | "metric" | "table" | "area-chart";

export interface WidgetConfig {
  dataSourceId: string;
  query: string;
  refreshInterval: number;
  colorScheme?: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetCreatePayload {
  dashboardId: string;
  title: string;
  type: WidgetType;
  config: WidgetConfig;
  position: WidgetPosition;
}

export interface EmbedConfig {
  id: string;
  dashboardId: string;
  token: string;
  allowedOrigins: string[];
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedCreatePayload {
  dashboardId: string;
  allowedOrigins: string[];
  expiresAt?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
