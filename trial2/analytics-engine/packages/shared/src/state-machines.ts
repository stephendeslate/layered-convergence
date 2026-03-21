import { SyncStatus } from './enums';

export const SYNC_TRANSITIONS: Record<SyncStatus, SyncStatus[]> = {
  [SyncStatus.PENDING]: [SyncStatus.RUNNING],
  [SyncStatus.RUNNING]: [SyncStatus.COMPLETED, SyncStatus.FAILED],
  [SyncStatus.COMPLETED]: [],
  [SyncStatus.FAILED]: [],
};

export function canTransition(from: SyncStatus, to: SyncStatus): boolean {
  return SYNC_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: SyncStatus, to: SyncStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid sync status transition: ${from} -> ${to}. Allowed transitions from ${from}: [${SYNC_TRANSITIONS[from].join(', ')}]`,
    );
  }
}
