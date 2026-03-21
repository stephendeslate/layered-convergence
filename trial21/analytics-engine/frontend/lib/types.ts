// [TRACED:UI-001] Frontend type definitions matching backend API contract
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: 'VIEWER' | 'EDITOR' | 'ANALYST';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ActionState {
  error?: string;
  success?: boolean;
}

export interface Dashboard {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  widgets?: Widget[];
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataPoint {
  id: string;
  value: string;
  label: string;
  timestamp: string;
  tenantId: string;
  dataSourceId: string;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  state: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  config: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Widget {
  id: string;
  title: string;
  type: 'BAR' | 'LINE' | 'PIE' | 'TABLE' | 'KPI';
  config: Record<string, unknown>;
  dashboardId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Embed {
  id: string;
  token: string;
  dashboardId: string;
  tenantId: string;
  expiresAt: string;
  createdAt: string;
}

export interface SyncRun {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  dataSourceId: string;
  tenantId: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
}
