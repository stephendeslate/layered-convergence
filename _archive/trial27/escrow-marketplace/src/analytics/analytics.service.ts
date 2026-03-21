import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactionSummary(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
    });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);

    const byStatus: Record<string, number> = {};
    for (const t of transactions) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    }

    return {
      totalTransactions: transactions.length,
      totalVolume,
      totalFees,
      byStatus,
    };
  }

  async getDisputeMetrics(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
      include: { disputes: true },
    });

    const totalTransactions = transactions.length;
    const disputedTransactions = transactions.filter(
      (t) => t.status === TransactionStatus.DISPUTED || t.disputes.length > 0,
    ).length;

    const disputes = transactions.flatMap((t) => t.disputes);
    const resolvedDisputes = disputes.filter(
      (d) => d.status === 'RESOLVED_BUYER' || d.status === 'RESOLVED_PROVIDER',
    ).length;

    return {
      totalDisputes: disputes.length,
      disputeRate: totalTransactions > 0 ? disputedTransactions / totalTransactions : 0,
      resolvedDisputes,
      openDisputes: disputes.length - resolvedDisputes,
    };
  }

  async getRevenueBreakdown(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: { in: [TransactionStatus.RELEASED, TransactionStatus.HELD] },
      },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    const releasedRevenue = transactions
      .filter((t) => t.status === TransactionStatus.RELEASED)
      .reduce((sum, t) => sum + t.platformFee, 0);
    const pendingRevenue = transactions
      .filter((t) => t.status === TransactionStatus.HELD)
      .reduce((sum, t) => sum + t.platformFee, 0);

    return {
      totalRevenue,
      releasedRevenue,
      pendingRevenue,
    };
  }
}
