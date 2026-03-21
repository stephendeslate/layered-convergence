import { Injectable, BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';

export const VALID_TRANSITIONS: Map<TransactionStatus, TransactionStatus[]> = new Map([
  [TransactionStatus.CREATED, [TransactionStatus.HELD, TransactionStatus.EXPIRED]],
  [TransactionStatus.HELD, [TransactionStatus.RELEASED, TransactionStatus.DISPUTED, TransactionStatus.REFUNDED, TransactionStatus.EXPIRED]],
  [TransactionStatus.DISPUTED, [TransactionStatus.RELEASED, TransactionStatus.REFUNDED]],
  [TransactionStatus.RELEASED, []],
  [TransactionStatus.REFUNDED, []],
  [TransactionStatus.EXPIRED, []],
]);

@Injectable()
export class TransactionStateMachine {
  validateTransition(from: TransactionStatus, to: TransactionStatus): void {
    const allowed = VALID_TRANSITIONS.get(from);
    if (!allowed || !allowed.includes(to)) {
      throw new BadRequestException(
        `Invalid state transition from ${from} to ${to}`,
      );
    }
  }

  canTransition(from: TransactionStatus, to: TransactionStatus): boolean {
    const allowed = VALID_TRANSITIONS.get(from);
    return !!allowed && allowed.includes(to);
  }

  getValidTransitions(from: TransactionStatus): TransactionStatus[] {
    return VALID_TRANSITIONS.get(from) || [];
  }
}
