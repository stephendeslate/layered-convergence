import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionStatus, PayoutStatus } from '../../generated/prisma/client.js';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayout(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException('Transaction must be in RELEASED status to create a payout');
    }

    if (transaction.providerId !== userId) {
      throw new BadRequestException('Only the provider can request a payout');
    }

    const amount = Number(transaction.amount);
    const feePercent = Number(transaction.platformFeePercent);
    const payoutAmount = amount * (100 - feePercent) / 100;

    const payout = await this.prisma.payout.create({
      data: {
        userId,
        amount: payoutAmount,
        status: PayoutStatus.PENDING,
      },
    });

    return payout;
  }

  async listPayouts(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
