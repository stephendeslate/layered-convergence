export const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['running'],
  running: ['completed', 'failed'],
  completed: [],
  failed: ['pending'],
};

export const DATA_SOURCE_TRANSITIONS: Record<string, string[]> = {
  active: ['paused', 'archived'],
  paused: ['active', 'archived'],
  archived: [],
};
