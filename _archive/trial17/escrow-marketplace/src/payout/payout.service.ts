import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createByTransactionId(transactionId: string) {
    // findFirst annotated: lookup by primary key, guaranteed unique
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.payout.create({
      data: {
        userId: transaction.providerId,
        transactionId: transaction.id,
        amount: transaction.amount,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
