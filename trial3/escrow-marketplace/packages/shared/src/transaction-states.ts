export const TRANSACTION_STATES = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED',
  TRANSFER_PENDING: 'TRANSFER_PENDING',
  TRANSFERRED: 'TRANSFERRED',
  PAYOUT_PENDING: 'PAYOUT_PENDING',
  PAID: 'PAID',
  RESOLVED_BUYER: 'RESOLVED_BUYER',
  RESOLVED_PROVIDER: 'RESOLVED_PROVIDER',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const;

export type TransactionState =
  (typeof TRANSACTION_STATES)[keyof typeof TRANSACTION_STATES];

export const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['PAYMENT_PENDING'],
  PAYMENT_PENDING: ['HELD'],
  HELD: ['RELEASED', 'DISPUTED', 'EXPIRED'],
  EXPIRED: ['RELEASED'],
  RELEASED: ['TRANSFER_PENDING'],
  TRANSFER_PENDING: ['TRANSFERRED'],
  TRANSFERRED: ['PAYOUT_PENDING'],
  PAYOUT_PENDING: ['PAID'],
  DISPUTED: ['RESOLVED_BUYER', 'RESOLVED_PROVIDER'],
  RESOLVED_BUYER: ['REFUND_PENDING'],
  RESOLVED_PROVIDER: ['RELEASED'],
  REFUND_PENDING: ['REFUNDED'],
};

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidTargets(from: string): string[] {
  return VALID_TRANSITIONS[from] ?? [];
}

// Terminal states — no further transitions possible
export const TERMINAL_STATES: string[] = ['PAID', 'REFUNDED'];

export function isTerminalState(state: string): boolean {
  return TERMINAL_STATES.includes(state);
}
