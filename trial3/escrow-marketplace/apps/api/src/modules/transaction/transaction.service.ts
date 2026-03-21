import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isValidTransition, getValidTargets } from '@escrow-marketplace/shared';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, data: {
    providerId: string;
    amount: number;
    currency?: string;
    description: string;
    holdDays?: number;
  }) {
    const platformFee = Math.max(Math.round(data.amount * 0.05), 50); // 5%, min $0.50
    const holdDays = data.holdDays ?? 14;
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + holdDays);

    // Verify provider exists
    await this.prisma.user.findFirstOrThrow({
      where: { id: data.providerId, role: 'PROVIDER' },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: data.providerId,
        amount: data.amount,
        currency: data.currency ?? 'usd',
        description: data.description,
        platformFee,
        holdUntil,
        status: 'CREATED',
      },
    });

    // Log initial state
    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: transaction.id,
        fromState: 'NONE',
        toState: 'CREATED',
        reason: 'Transaction created by buyer',
      },
    });

    return transaction;
  }

  async findByIdForUser(id: string, userId: string) {
    return this.prisma.transaction.findFirstOrThrow({
      where: {
        id,
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        stateHistory: { orderBy: { timestamp: 'asc' } },
        disputes: true,
      },
    });
  }

  async findAllForUser(userId: string, role: string) {
    const where = role === 'ADMIN'
      ? {}
      : role === 'BUYER'
        ? { buyerId: userId }
        : { providerId: userId };

    return this.prisma.transaction.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async transitionState(id: string, userId: string, toState: string, reason?: string) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: {
        id,
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
    });

    const fromState = transaction.status;

    if (!isValidTransition(fromState, toState)) {
      throw new BadRequestException(
        `Invalid transition from ${fromState} to ${toState}. Valid targets: ${getValidTargets(fromState).join(', ') || 'none (terminal state)'}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: { status: toState as never },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromState,
          toState,
          reason: reason ?? `Transitioned to ${toState}`,
        },
      }),
    ]);

    return updated;
  }

  async release(id: string, buyerId: string) {
    return this.transitionState(id, buyerId, 'RELEASED', 'Buyer confirmed delivery');
  }

  async getTimeline(id: string, userId: string) {
    // Verify access
    await this.prisma.transaction.findFirstOrThrow({
      where: {
        id,
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
    });

    return this.prisma.transactionStateHistory.findMany({
      where: { transactionId: id },
      orderBy: { timestamp: 'asc' },
    });
  }

  async getStats() {
    const [total, held, disputed, paid, totalVolume] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'HELD' } }),
      this.prisma.transaction.count({ where: { status: 'DISPUTED' } }),
      this.prisma.transaction.count({ where: { status: 'PAID' } }),
      this.prisma.transaction.aggregate({ _sum: { amount: true } }),
    ]);

    return {
      total,
      held,
      disputed,
      paid,
      totalVolume: totalVolume._sum.amount ?? 0,
      disputeRate: total > 0 ? (disputed / total * 100).toFixed(1) : '0.0',
    };
  }
}
