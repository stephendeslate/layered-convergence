import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProvider(userId: string) {
    return this.prisma.payout.findMany({
      where: { providerId: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string, id: string) {
    return this.prisma.payout.findFirstOrThrow({
      where: { id, providerId: userId },
      include: { transaction: { include: { buyer: true } } },
    });
  }

  async getPayoutSummary(userId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: { providerId: userId },
    });

    const totalEarned = payouts
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = payouts
      .filter((p) => p.status === 'PENDING')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayouts: payouts.length,
      totalEarned,
      pendingAmount: pending,
    };
  }
}
