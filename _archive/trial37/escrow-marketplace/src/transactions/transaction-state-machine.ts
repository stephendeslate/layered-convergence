import { BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> =
  {
    PENDING: [TransactionStatus.PAYMENT_HELD, TransactionStatus.CANCELLED],
    PAYMENT_HELD: [
      TransactionStatus.DELIVERED,
      TransactionStatus.DISPUTED,
      TransactionStatus.EXPIRED,
      TransactionStatus.CANCELLED,
    ],
    DELIVERED: [TransactionStatus.RELEASED, TransactionStatus.DISPUTED],
    RELEASED: [],
    DISPUTED: [
      TransactionStatus.REFUNDED,
      TransactionStatus.RELEASED,
    ],
    REFUNDED: [],
    EXPIRED: [TransactionStatus.REFUNDED],
    CANCELLED: [],
  };

export function validateTransition(
  from: TransactionStatus,
  to: TransactionStatus,
): void {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new BadRequestException(
      `Invalid transition from ${from} to ${to}`,
    );
  }
}
