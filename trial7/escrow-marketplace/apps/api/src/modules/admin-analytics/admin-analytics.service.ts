import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalTransactions,
      heldTransactions,
      completedTransactions,
      disputedTransactions,
      totalUsers,
    ] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: TransactionStatus.HELD } }),
      this.prisma.transaction.count({ where: { status: TransactionStatus.COMPLETED } }),
      this.prisma.transaction.count({ where: { status: TransactionStatus.DISPUTED } }),
      this.prisma.user.count(),
    ]);

    const transactions = await this.prisma.transaction.findMany({
      where: { status: TransactionStatus.COMPLETED },
      select: { amount: true, platformFee: true },
    });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const disputeRate = totalTransactions > 0
      ? ((disputedTransactions / totalTransactions) * 100).toFixed(2)
      : '0.00';

    return {
      totalTransactions,
      heldTransactions,
      completedTransactions,
      disputedTransactions,
      totalUsers,
      totalVolume,
      totalFees,
      disputeRate: `${disputeRate}%`,
    };
  }

  async getTransactionsByStatus() {
    const statuses = Object.values(TransactionStatus);
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.transaction.count({ where: { status } }),
      })),
    );
    return counts;
  }
}
