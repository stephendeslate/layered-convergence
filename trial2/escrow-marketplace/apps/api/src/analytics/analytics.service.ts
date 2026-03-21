import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(period: string = '30d') {
    const startDate = this.getStartDate(period);

    const [totalTransactions, volumeResult, feeResult, disputeCount, statusCounts] =
      await Promise.all([
        this.prisma.transaction.count({
          where: { createdAt: { gte: startDate } },
        }),
        this.prisma.transaction.aggregate({
          where: { createdAt: { gte: startDate } },
          _sum: { amount: true },
        }),
        this.prisma.transaction.aggregate({
          where: {
            createdAt: { gte: startDate },
            status: { in: ['RELEASED'] },
          },
          _sum: { platformFeeAmount: true },
        }),
        this.prisma.dispute.count({
          where: { createdAt: { gte: startDate } },
        }),
        this.prisma.transaction.groupBy({
          by: ['status'],
          where: { createdAt: { gte: startDate } },
          _count: true,
        }),
      ]);

    const disputeRate =
      totalTransactions > 0
        ? Math.round((disputeCount / totalTransactions) * 10000) / 100
        : 0;

    return {
      totalTransactions,
      totalVolume: volumeResult._sum.amount ?? 0,
      totalFees: feeResult._sum.platformFeeAmount ?? 0,
      disputeRate,
      transactionsByStatus: statusCounts.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }

  async getVolume(period: string = '30d') {
    const startDate = this.getStartDate(period);

    const transactions = await this.prisma.transaction.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        amount: true,
        platformFeeAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = new Map<string, { count: number; volume: number; fees: number }>();

    for (const tx of transactions) {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      const existing = grouped.get(dateKey) ?? { count: 0, volume: 0, fees: 0 };
      existing.count += 1;
      existing.volume += tx.amount;
      existing.fees += tx.platformFeeAmount;
      grouped.set(dateKey, existing);
    }

    return {
      data: Array.from(grouped.entries()).map(([date, values]) => ({
        date,
        ...values,
      })),
    };
  }

  async getProviders() {
    const providers = await this.prisma.user.findMany({
      where: { role: 'PROVIDER' },
      select: {
        id: true,
        name: true,
        providerTransactions: {
          select: {
            amount: true,
            status: true,
          },
        },
      },
    });

    return {
      data: providers.map((p) => {
        const disputeCount = p.providerTransactions.filter(
          (t) => t.status === 'DISPUTED',
        ).length;
        const totalVolume = p.providerTransactions.reduce(
          (sum, t) => sum + t.amount,
          0,
        );

        return {
          providerId: p.id,
          providerName: p.name,
          transactionCount: p.providerTransactions.length,
          totalVolume,
          disputeCount,
          disputeRate:
            p.providerTransactions.length > 0
              ? Math.round(
                  (disputeCount / p.providerTransactions.length) * 10000,
                ) / 100
              : 0,
          averageTransactionValue:
            p.providerTransactions.length > 0
              ? Math.round(totalVolume / p.providerTransactions.length)
              : 0,
        };
      }),
    };
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }
}
