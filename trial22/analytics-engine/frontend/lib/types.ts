// [TRACED:DM-007] Frontend type definitions matching Prisma schema

export type Role = 'VIEWER' | 'EDITOR' | 'ANALYST';

export type PipelineStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';

export type SyncRunStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
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
  key: string;
  value: string;
  timestamp: string;
  tenantId: string;
  dataSourceId: string;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  status: PipelineStatus;
  config: Record<string, unknown>;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  name: string;
  tenantId: string;
  widgets?: Widget[];
  createdAt: string;
  updatedAt: string;
}

export interface Widget {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  dashboardId: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Embed {
  id: string;
  token: string;
  config: Record<string, unknown>;
  tenantId: string;
  expiresAt: string;
  createdAt: string;
}

export interface SyncRun {
  id: string;
  status: SyncRunStatus;
  dataSourceId: string;
  tenantId: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
}
