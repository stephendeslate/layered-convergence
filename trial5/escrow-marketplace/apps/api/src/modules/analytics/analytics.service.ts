import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransactionStatus, PayoutStatus } from '@prisma/client';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(dto: QueryAnalyticsDto) {
    const where: Record<string, unknown> = {};
    if (dto.startDate || dto.endDate) {
      where.createdAt = {};
      if (dto.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(dto.startDate);
      if (dto.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(dto.endDate);
    }

    const transactions = await this.prisma.transaction.findMany({ where });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const disputeCount = transactions.filter(
      (t) => t.status === TransactionStatus.DISPUTED ||
             t.status === TransactionStatus.RESOLVED_BUYER ||
             t.status === TransactionStatus.RESOLVED_PROVIDER,
    ).length;

    const statusCounts = transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTransactions: transactions.length,
      totalVolume,
      totalFees,
      disputeCount,
      disputeRate: transactions.length > 0 ? disputeCount / transactions.length : 0,
      averageTransactionAmount: transactions.length > 0 ? totalVolume / transactions.length : 0,
      statusDistribution: statusCounts,
    };
  }

  async getVolumeByDay(dto: QueryAnalyticsDto) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: dto.startDate ? new Date(dto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lte: dto.endDate ? new Date(dto.endDate) : new Date(),
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyVolume = new Map<string, { count: number; volume: number; fees: number }>();

    for (const t of transactions) {
      const day = t.createdAt.toISOString().split('T')[0];
      const entry = dailyVolume.get(day) || { count: 0, volume: 0, fees: 0 };
      entry.count += 1;
      entry.volume += t.amount;
      entry.fees += t.platformFee;
      dailyVolume.set(day, entry);
    }

    return Array.from(dailyVolume.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getPayoutAnalytics(userId?: string) {
    const where = userId ? { userId } : {};
    const payouts = await this.prisma.payout.findMany({ where });

    const total = payouts.reduce((sum, p) => sum + p.amount, 0);
    const completed = payouts.filter((p) => p.status === PayoutStatus.COMPLETED);

    return {
      totalPayouts: payouts.length,
      totalAmount: total,
      completedPayouts: completed.length,
      completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
    };
  }
}
