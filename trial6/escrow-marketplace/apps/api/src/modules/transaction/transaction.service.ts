import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { TransactionStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.HELD],
  [TransactionStatus.HELD]: [
    TransactionStatus.RELEASED,
    TransactionStatus.DISPUTED,
    TransactionStatus.EXPIRED,
  ],
  [TransactionStatus.RELEASED]: [],
  [TransactionStatus.DISPUTED]: [
    TransactionStatus.RELEASED,
    TransactionStatus.REFUNDED,
  ],
  [TransactionStatus.REFUNDED]: [],
  [TransactionStatus.EXPIRED]: [TransactionStatus.REFUNDED],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const platformFeeRate = 0.05;
    const platformFee = Math.round(dto.amount * platformFeeRate);

    return this.prisma.transaction.create({
      data: {
        buyerId: dto.buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        status: TransactionStatus.PENDING,
        platformFeeRate,
        platformFee,
        holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async transition(
    id: string,
    toState: TransactionStatus,
    reason?: string,
  ) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { id },
    });

    const allowed = VALID_TRANSITIONS[transaction.status];
    if (!allowed.includes(toState)) {
      throw new BadRequestException(
        `Invalid transition from ${transaction.status} to ${toState}`,
      );
    }

    // Exhaustive switch for type safety — all states must be handled
    switch (toState) {
      case TransactionStatus.PENDING:
      case TransactionStatus.HELD:
      case TransactionStatus.RELEASED:
      case TransactionStatus.DISPUTED:
      case TransactionStatus.REFUNDED:
      case TransactionStatus.EXPIRED:
        break;
      default: {
        const _exhaustive: never = toState;
        throw new Error(`Unhandled transaction status: ${_exhaustive}`);
      }
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: { status: toState },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState: transaction.status,
          toState,
          reason,
        },
      }),
    ]);

    return updated;
  }

  async findAll(query: TransactionQueryDto) {
    return this.prisma.transaction.findMany({
      where: {
        ...(query.buyerId ? { buyerId: query.buyerId } : {}),
        ...(query.providerId ? { providerId: query.providerId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ?? 50,
    });
  }

  async findOne(id: string) {
    return this.prisma.transaction.findFirstOrThrow({
      where: { id },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
        disputes: true,
      },
    });
  }

  async release(id: string, reason?: string) {
    return this.transition(id, TransactionStatus.RELEASED, reason ?? 'Manual release');
  }

  async refund(id: string, reason?: string) {
    return this.transition(id, TransactionStatus.REFUNDED, reason ?? 'Refund initiated');
  }
}
