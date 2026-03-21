/**
 * Shared constants for the Analytics Engine platform.
 * Used by both apps/api and apps/web.
 */

import { PipelineStatus, SyncRunStatus, Role } from './types';

/** Roles available for user registration (excludes ADMIN) */
export const REGISTERABLE_ROLES: Role[] = [Role.VIEWER, Role.EDITOR, Role.ANALYST];

/** All valid pipeline status values */
export const PIPELINE_STATUSES: PipelineStatus[] = [
  PipelineStatus.DRAFT,
  PipelineStatus.ACTIVE,
  PipelineStatus.PAUSED,
  PipelineStatus.ARCHIVED,
];

/** All valid sync run status values */
export const SYNC_RUN_STATUSES: SyncRunStatus[] = [
  SyncRunStatus.PENDING,
  SyncRunStatus.RUNNING,
  SyncRunStatus.COMPLETED,
  SyncRunStatus.FAILED,
];

/** Pipeline state machine: allowed transitions from each status */
export const PIPELINE_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  [PipelineStatus.DRAFT]: [PipelineStatus.ACTIVE],
  [PipelineStatus.ACTIVE]: [PipelineStatus.PAUSED, PipelineStatus.ARCHIVED],
  [PipelineStatus.PAUSED]: [PipelineStatus.ACTIVE, PipelineStatus.ARCHIVED],
  [PipelineStatus.ARCHIVED]: [],
};

/** SyncRun state machine: allowed transitions from each status */
export const SYNC_RUN_TRANSITIONS: Record<SyncRunStatus, SyncRunStatus[]> = {
  [SyncRunStatus.PENDING]: [SyncRunStatus.RUNNING],
  [SyncRunStatus.RUNNING]: [SyncRunStatus.COMPLETED, SyncRunStatus.FAILED],
  [SyncRunStatus.COMPLETED]: [],
  [SyncRunStatus.FAILED]: [],
};

/** Maximum number of data points per query */
export const MAX_DATA_POINTS_PER_QUERY = 10000;

/** Default page size for list endpoints */
export const DEFAULT_PAGE_SIZE = 20;
