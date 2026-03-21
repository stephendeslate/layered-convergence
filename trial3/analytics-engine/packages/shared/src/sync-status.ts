export const SYNC_STATUSES = {
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type SyncStatus = (typeof SYNC_STATUSES)[keyof typeof SYNC_STATUSES];
