import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';

/**
 * Valid state transitions for the transaction state machine.
 */
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.HELD],
  [TransactionStatus.HELD]: [
    TransactionStatus.RELEASED,
    TransactionStatus.DISPUTED,
    TransactionStatus.EXPIRED,
  ],
  [TransactionStatus.RELEASED]: [TransactionStatus.COMPLETED],
  [TransactionStatus.DISPUTED]: [
    TransactionStatus.RELEASED,
    TransactionStatus.REFUNDED,
  ],
  [TransactionStatus.REFUNDED]: [],
  [TransactionStatus.EXPIRED]: [],
  [TransactionStatus.COMPLETED]: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    // Verify provider exists
    await this.prisma.user.findFirstOrThrow({
      where: { id: dto.providerId, role: 'PROVIDER' },
    });

    const platformFee = Math.round(dto.amount * 0.05); // 5% platform fee

    return this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        platformFee,
        description: dto.description,
        stateHistory: {
          create: {
            fromState: 'NONE',
            toState: TransactionStatus.PENDING,
            reason: 'Transaction created',
          },
        },
      },
      include: { stateHistory: true },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
      include: { stateHistory: { orderBy: { timestamp: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.transaction.findFirstOrThrow({
      where: { id },
      include: {
        stateHistory: { orderBy: { timestamp: 'asc' } },
        buyer: true,
        provider: true,
        disputes: true,
        payout: true,
      },
    });
  }

  /**
   * Transition a transaction to a new state.
   * Convention 5.22: uses BadRequestException (not plain Error) for invalid transitions.
   */
  async transition(id: string, dto: TransitionTransactionDto) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { id },
    });

    const allowedTransitions = VALID_TRANSITIONS[transaction.status];
    if (!allowedTransitions.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${transaction.status} to ${dto.toStatus}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState: transaction.status,
          toState: dto.toStatus,
          reason: dto.reason,
        },
      });

      const updatedData: Record<string, unknown> = { status: dto.toStatus };

      if (dto.toStatus === TransactionStatus.HELD) {
        updatedData['holdUntil'] = new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000, // 14-day hold
        );
      }

      return tx.transaction.update({
        where: { id },
        data: updatedData,
        include: { stateHistory: { orderBy: { timestamp: 'asc' } } },
      });
    });
  }

  /**
   * Validate state transition using exhaustive switch.
   * Convention 5.22: uses BadRequestException instead of plain Error.
   */
  validateTransitionReason(toState: TransactionStatus): string {
    switch (toState) {
      case TransactionStatus.PENDING:
        return 'Transaction initiated';
      case TransactionStatus.HELD:
        return 'Payment captured and held';
      case TransactionStatus.RELEASED:
        return 'Funds released to provider';
      case TransactionStatus.DISPUTED:
        return 'Dispute raised by buyer';
      case TransactionStatus.REFUNDED:
        return 'Funds refunded to buyer';
      case TransactionStatus.EXPIRED:
        return 'Hold period expired';
      case TransactionStatus.COMPLETED:
        return 'Payout completed';
      default: {
        const _exhaustive: never = toState;
        throw new BadRequestException(
          `Invalid state transition to: ${_exhaustive}`,
        );
      }
    }
  }
}
