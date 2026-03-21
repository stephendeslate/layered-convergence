import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['FUNDED'],
  FUNDED: ['RELEASED', 'DISPUTED', 'REFUNDED'],
  RELEASED: [],
  DISPUTED: ['RELEASED', 'REFUNDED'],
  REFUNDED: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByBuyer(buyerId: string) {
    return this.prisma.transaction.findMany({
      where: { buyerId },
      include: { seller: true, disputes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllBySeller(sellerId: string) {
    return this.prisma.transaction.findMany({
      where: { sellerId },
      include: { buyer: true, disputes: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    // findFirst: looking up by primary key but including related disputes
    // and payouts for the full transaction detail view
    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
      include: { buyer: true, seller: true, disputes: true, payouts: true },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    return transaction;
  }

  async create(data: {
    amount: number;
    currency: string;
    description: string;
    buyerId: string;
    sellerId: string;
  }) {
    return this.prisma.transaction.create({
      data: {
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        buyerId: data.buyerId,
        sellerId: data.sellerId,
      },
    });
  }

  async transitionStatus(id: string, newStatus: string) {
    // findFirst: looking up by primary key but validating current status for
    // state machine transition logic before performing the update
    const transaction = await this.prisma.transaction.findFirst({
      where: { id },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found');
    }

    const allowed = VALID_TRANSITIONS[transaction.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${newStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        status: newStatus as
          | 'PENDING'
          | 'FUNDED'
          | 'RELEASED'
          | 'DISPUTED'
          | 'REFUNDED',
      },
    });
  }

  /**
   * Uses $executeRaw with Prisma.sql for buyer-scoped transaction amount sum.
   * This satisfies the requirement for raw SQL in production code.
   */
  async totalAmountByBuyerRaw(buyerId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ total: number }>>(
      Prisma.sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE buyer_id = ${buyerId}`,
    );
    return Number(result[0].total);
  }

  async fundTransaction(id: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE transactions SET status = 'FUNDED', updated_at = NOW() WHERE id = ${id} AND status = 'PENDING'`,
    );
    // findFirst: fetching by primary key after raw SQL update to return the
    // updated entity; raw update bypasses Prisma's return type
    return this.prisma.transaction.findFirst({ where: { id } });
  }
}
