export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
}

export interface AuthResult {
  accessToken: string;
  user: User;
}

export type DataSourceType = 'POSTGRESQL' | 'MYSQL' | 'CSV' | 'API';
export type DataSourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export interface DataSource {
  id: string;
  tenantId: string;
  name: string;
  type: DataSourceType;
  config: Record<string, unknown>;
  status: DataSourceStatus;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
  pipelines?: Pipeline[];
}

export type PipelineStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FAILED' | 'COMPLETED';

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  dataSourceId: string;
  dataSource?: DataSource;
  status: PipelineStatus;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  widgets?: Widget[];
  embeds?: EmbedConfig[];
  _count?: { widgets: number };
}

export type WidgetType = 'LINE' | 'BAR' | 'PIE' | 'METRIC' | 'TABLE';

export interface Widget {
  id: string;
  tenantId: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  config: Record<string, unknown>;
  position: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedConfig {
  id: string;
  tenantId: string;
  dashboardId: string;
  dashboard?: Dashboard;
  token: string;
  allowedOrigins: string[];
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryCacheEntry {
  id: string;
  tenantId: string;
  queryHash: string;
  result: Record<string, unknown>;
  ttl: number;
  expiresAt: string;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
