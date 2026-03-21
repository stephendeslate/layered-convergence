export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    role: string;
  };
}

export interface Dashboard {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  layout: Record<string, unknown>;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  widgets: Widget[];
  embeds: Embed[];
}

export interface Widget {
  id: string;
  tenantId: string;
  dashboardId: string;
  type: 'LINE' | 'BAR' | 'PIE' | 'METRIC' | 'TABLE';
  title: string;
  config: Record<string, unknown>;
  position: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface DataSource {
  id: string;
  tenantId: string;
  name: string;
  type: 'POSTGRESQL' | 'MYSQL' | 'CSV' | 'API';
  config: Record<string, unknown>;
  status: string;
  syncFrequency: string;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
  syncRuns: SyncRun[];
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FAILED' | 'COMPLETED';
  config: Record<string, unknown>;
  dataSourceId: string;
  createdAt: string;
  updatedAt: string;
  dataSource: DataSource;
}

export interface Embed {
  id: string;
  tenantId: string;
  dashboardId: string;
  token: string;
  expiresAt: string | null;
  allowedOrigins: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dashboard: Dashboard;
}

export interface DataPoint {
  id: string;
  tenantId: string;
  dataSourceId: string;
  metric: string;
  value: number;
  dimensions: Record<string, unknown>;
  timestamp: string;
  createdAt: string;
}

export interface SyncRun {
  id: string;
  tenantId: string;
  dataSourceId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  recordsProcessed: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActionState {
  error: string | null;
  success: boolean;
}
