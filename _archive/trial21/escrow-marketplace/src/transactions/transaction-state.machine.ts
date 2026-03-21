import { TransactionStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.CREATED]: [TransactionStatus.HELD],
  [TransactionStatus.HELD]: [
    TransactionStatus.RELEASED,
    TransactionStatus.DISPUTED,
    TransactionStatus.EXPIRED,
  ],
  [TransactionStatus.DISPUTED]: [
    TransactionStatus.RESOLVED_BUYER,
    TransactionStatus.RESOLVED_PROVIDER,
  ],
  [TransactionStatus.RESOLVED_BUYER]: [TransactionStatus.REFUNDED],
  [TransactionStatus.RESOLVED_PROVIDER]: [TransactionStatus.RELEASED],
  [TransactionStatus.RELEASED]: [],
  [TransactionStatus.REFUNDED]: [],
  [TransactionStatus.EXPIRED]: [],
};

export function isValidTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
