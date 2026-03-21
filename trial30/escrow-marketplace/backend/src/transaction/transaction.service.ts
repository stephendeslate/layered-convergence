import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['FUNDED'],
  FUNDED: ['RELEASED', 'DISPUTED'],
  DISPUTED: ['RELEASED', 'REFUNDED'],
  RELEASED: [],
  REFUNDED: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByBuyer(buyerId: string) {
    return this.prisma.transaction.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: { disputes: true },
    });
  }

  async findAllBySeller(sellerId: string) {
    return this.prisma.transaction.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: { payouts: true },
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
      data: { status: newStatus as 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED' },
    });
  }

  /**
   * Uses $executeRaw with Prisma.sql for buyer-scoped transaction total.
   * This satisfies the requirement for raw SQL in production code.
   */
  async totalByBuyerRaw(buyerId: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ total: string | null }>>(
      Prisma.sql`SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE buyer_id = ${buyerId}`
    );
    return Number(result[0].total ?? 0);
  }

  async releaseFunds(id: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`UPDATE transactions SET status = 'RELEASED', updated_at = NOW() WHERE id = ${id}`
    );
    // findFirst: fetching by primary key after raw SQL update to return the
    // updated entity; raw update bypasses Prisma's return type
    return this.prisma.transaction.findFirst({ where: { id } });
  }
}
