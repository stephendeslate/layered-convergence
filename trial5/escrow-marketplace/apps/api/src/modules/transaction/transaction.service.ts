import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING_PAYMENT]: [TransactionStatus.HELD],
  [TransactionStatus.HELD]: [
    TransactionStatus.RELEASED,
    TransactionStatus.DISPUTED,
    TransactionStatus.EXPIRED,
  ],
  [TransactionStatus.RELEASED]: [TransactionStatus.PAID_OUT],
  [TransactionStatus.DISPUTED]: [
    TransactionStatus.RESOLVED_BUYER,
    TransactionStatus.RESOLVED_PROVIDER,
  ],
  [TransactionStatus.RESOLVED_BUYER]: [TransactionStatus.REFUNDED],
  [TransactionStatus.RESOLVED_PROVIDER]: [TransactionStatus.RELEASED],
  [TransactionStatus.PAID_OUT]: [],
  [TransactionStatus.REFUNDED]: [],
  [TransactionStatus.EXPIRED]: [],
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const platformFee = Math.round(dto.amount * (dto.platformFeeRate ?? 0.05));

    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId: dto.buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'usd',
        description: dto.description,
        platformFeeRate: dto.platformFeeRate ?? 0.05,
        platformFee,
        holdUntil: dto.holdUntil ? new Date(dto.holdUntil) : undefined,
      },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: transaction.id,
        fromStatus: TransactionStatus.PENDING_PAYMENT,
        toStatus: TransactionStatus.PENDING_PAYMENT,
        reason: 'Transaction created',
      },
    });

    return transaction;
  }

  async transition(id: string, dto: TransitionTransactionDto) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id },
    });

    const validTargets = VALID_TRANSITIONS[transaction.status];
    if (!validTargets.includes(dto.toStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${transaction.status} to ${dto.toStatus}. Valid targets: ${validTargets.join(', ')}`,
      );
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status: dto.toStatus },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: id,
        fromStatus: transaction.status,
        toStatus: dto.toStatus,
        reason: dto.reason,
      },
    });

    this.logger.log(
      `Transaction ${id} transitioned: ${transaction.status} -> ${dto.toStatus}`,
    );

    // Side effect: auto-create payout when PAID_OUT
    if (dto.toStatus === TransactionStatus.PAID_OUT) {
      await this.createPayout(updated);
    }

    return updated;
  }

  async findAll(userId?: string, role?: 'buyer' | 'provider') {
    const where: Record<string, unknown> = {};
    if (userId && role === 'buyer') where.buyerId = userId;
    if (userId && role === 'provider') where.providerId = userId;

    return this.prisma.transaction.findMany({
      where,
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
        dispute: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
        dispute: true,
        payout: true,
      },
    });
  }

  async getTimeline(id: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id },
      include: {
        stateHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    return transaction.stateHistory;
  }

  private async createPayout(transaction: {
    id: string;
    providerId: string;
    amount: number;
    platformFee: number;
  }) {
    const payoutAmount = transaction.amount - transaction.platformFee;

    await this.prisma.payout.create({
      data: {
        userId: transaction.providerId,
        transactionId: transaction.id,
        amount: payoutAmount,
      },
    });

    this.logger.log(
      `Payout created for transaction ${transaction.id}: $${payoutAmount / 100}`,
    );
  }
}
