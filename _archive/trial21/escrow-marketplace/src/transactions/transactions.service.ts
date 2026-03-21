import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransitionTransactionDto } from './dto';
import { isValidTransition, VALID_TRANSITIONS } from './transaction-state.machine';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, tenantId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        currency: dto.currency || 'usd',
        description: dto.description,
        platformFee: dto.platformFee || 0,
        buyerId,
        providerId: dto.providerId,
        tenantId,
        status: TransactionStatus.CREATED,
      },
      include: {
        buyer: { select: { id: true, email: true, name: true } },
        provider: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.transaction.findMany({
      where: { tenantId },
      include: {
        buyer: { select: { id: true, email: true, name: true } },
        provider: { select: { id: true, email: true, name: true } },
        stateHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        buyer: { select: { id: true, email: true, name: true } },
        provider: { select: { id: true, email: true, name: true } },
        stateHistory: { orderBy: { createdAt: 'desc' } },
        disputes: true,
        payout: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }

  async transition(
    id: string,
    tenantId: string,
    dto: TransitionTransactionDto,
    changedBy?: string,
  ) {
    const transaction = await this.findOne(id, tenantId);

    if (!isValidTransition(transaction.status, dto.toStatus)) {
      const allowed = VALID_TRANSITIONS[transaction.status];
      throw new BadRequestException(
        `Invalid transition from ${transaction.status} to ${dto.toStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: { status: dto.toStatus },
        include: {
          buyer: { select: { id: true, email: true, name: true } },
          provider: { select: { id: true, email: true, name: true } },
          stateHistory: { orderBy: { createdAt: 'desc' } },
        },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState: transaction.status,
          toState: dto.toStatus,
          reason: dto.reason,
          changedBy,
        },
      }),
    ]);

    return updated;
  }

  async findByBuyer(buyerId: string, tenantId: string) {
    return this.prisma.transaction.findMany({
      where: { buyerId, tenantId },
      include: {
        provider: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProvider(providerId: string, tenantId: string) {
    return this.prisma.transaction.findMany({
      where: { providerId, tenantId },
      include: {
        buyer: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAnalytics(tenantId: string) {
    const [total, byStatus, totalVolume] = await Promise.all([
      this.prisma.transaction.count({ where: { tenantId } }),
      this.prisma.transaction.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { tenantId },
        _sum: { amount: true, platformFee: true },
      }),
    ]);

    return {
      totalTransactions: total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      totalVolume: totalVolume._sum.amount || 0,
      totalFees: totalVolume._sum.platformFee || 0,
    };
  }
}
