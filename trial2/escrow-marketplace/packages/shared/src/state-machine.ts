export enum TransactionStatus {
  CREATED = 'CREATED',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  EVIDENCE_SUBMITTED = 'EVIDENCE_SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_BUYER = 'RESOLVED_BUYER',
  RESOLVED_PROVIDER = 'RESOLVED_PROVIDER',
  CLOSED = 'CLOSED',
}

export enum DisputeReason {
  SERVICE_NOT_DELIVERED = 'SERVICE_NOT_DELIVERED',
  SERVICE_NOT_AS_DESCRIBED = 'SERVICE_NOT_AS_DESCRIBED',
  UNAUTHORIZED_CHARGE = 'UNAUTHORIZED_CHARGE',
  DUPLICATE_CHARGE = 'DUPLICATE_CHARGE',
  OTHER = 'OTHER',
}

export enum UserRole {
  BUYER = 'BUYER',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  RESTRICTED = 'RESTRICTED',
  DISABLED = 'DISABLED',
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type TransitionTrigger =
  | 'PAYMENT_SUCCEEDED'
  | 'BUYER_CONFIRMED'
  | 'AUTO_RELEASED'
  | 'ADMIN_RELEASED'
  | 'BUYER_DISPUTED'
  | 'DISPUTE_RESOLVED_BUYER'
  | 'DISPUTE_RESOLVED_PROVIDER'
  | 'ADMIN_REFUNDED'
  | 'PAYMENT_EXPIRED'
  | 'BUYER_CANCELLED';

export interface StateTransition {
  from: TransactionStatus;
  to: TransactionStatus;
  trigger: TransitionTrigger;
}

export const VALID_TRANSITIONS: readonly StateTransition[] = [
  { from: TransactionStatus.CREATED, to: TransactionStatus.HELD, trigger: 'PAYMENT_SUCCEEDED' },
  { from: TransactionStatus.CREATED, to: TransactionStatus.EXPIRED, trigger: 'PAYMENT_EXPIRED' },
  { from: TransactionStatus.CREATED, to: TransactionStatus.EXPIRED, trigger: 'BUYER_CANCELLED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.RELEASED, trigger: 'BUYER_CONFIRMED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.RELEASED, trigger: 'AUTO_RELEASED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.RELEASED, trigger: 'ADMIN_RELEASED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.DISPUTED, trigger: 'BUYER_DISPUTED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.REFUNDED, trigger: 'ADMIN_REFUNDED' },
  { from: TransactionStatus.DISPUTED, to: TransactionStatus.RELEASED, trigger: 'DISPUTE_RESOLVED_PROVIDER' },
  { from: TransactionStatus.DISPUTED, to: TransactionStatus.REFUNDED, trigger: 'DISPUTE_RESOLVED_BUYER' },
] as const;

export const TERMINAL_STATES: readonly TransactionStatus[] = [
  TransactionStatus.RELEASED,
  TransactionStatus.REFUNDED,
  TransactionStatus.EXPIRED,
] as const;

export function isTerminalState(status: TransactionStatus): boolean {
  return (TERMINAL_STATES as readonly TransactionStatus[]).includes(status);
}

export function canTransition(
  from: TransactionStatus,
  to: TransactionStatus,
  trigger: TransitionTrigger,
): boolean {
  return VALID_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.trigger === trigger,
  );
}

export function getValidTransitions(from: TransactionStatus): StateTransition[] {
  return VALID_TRANSITIONS.filter((t) => t.from === from);
}

export function getValidTargetStates(from: TransactionStatus): TransactionStatus[] {
  return [...new Set(getValidTransitions(from).map((t) => t.to))];
}
