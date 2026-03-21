export const WORK_ORDER_STATUSES = {
  UNASSIGNED: 'UNASSIGNED',
  ASSIGNED: 'ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ON_SITE: 'ON_SITE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  INVOICED: 'INVOICED',
  PAID: 'PAID',
} as const;

export type WorkOrderStatus =
  (typeof WORK_ORDER_STATUSES)[keyof typeof WORK_ORDER_STATUSES];

export const VALID_TRANSITIONS: Record<string, string[]> = {
  UNASSIGNED: ['ASSIGNED'],
  ASSIGNED: ['EN_ROUTE', 'UNASSIGNED'],
  EN_ROUTE: ['ON_SITE', 'ASSIGNED'],
  ON_SITE: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidTargets(from: string): string[] {
  return VALID_TRANSITIONS[from] ?? [];
}

// Terminal states
export const TERMINAL_STATES: string[] = ['PAID'];

export function isTerminalState(state: string): boolean {
  return TERMINAL_STATES.includes(state);
}
