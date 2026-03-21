import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactionVolume(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
      select: { amount: true, status: true, currency: true },
    });

    const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCount = transactions.length;

    const byStatus: Record<string, { count: number; volume: number }> = {};
    for (const t of transactions) {
      if (!byStatus[t.status]) {
        byStatus[t.status] = { count: 0, volume: 0 };
      }
      byStatus[t.status].count++;
      byStatus[t.status].volume += t.amount;
    }

    return { totalVolume, totalCount, byStatus };
  }

  async getPlatformFees(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        status: { in: [TransactionStatus.RELEASED] },
      },
      select: { platformFee: true },
    });

    const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
    return { totalFees, transactionCount: transactions.length };
  }

  async getDisputeRate(tenantId: string) {
    const totalTransactions = await this.prisma.transaction.count({
      where: { tenantId },
    });

    const disputedTransactions = await this.prisma.transaction.count({
      where: { tenantId, status: TransactionStatus.DISPUTED },
    });

    const refundedTransactions = await this.prisma.transaction.count({
      where: { tenantId, status: TransactionStatus.REFUNDED },
    });

    const disputeRate = totalTransactions > 0 ? (disputedTransactions / totalTransactions) * 100 : 0;
    const refundRate = totalTransactions > 0 ? (refundedTransactions / totalTransactions) * 100 : 0;

    return {
      totalTransactions,
      disputedTransactions,
      refundedTransactions,
      disputeRate: Math.round(disputeRate * 100) / 100,
      refundRate: Math.round(refundRate * 100) / 100,
    };
  }

  async getDashboard(tenantId: string) {
    const [volume, fees, disputeRate] = await Promise.all([
      this.getTransactionVolume(tenantId),
      this.getPlatformFees(tenantId),
      this.getDisputeRate(tenantId),
    ]);

    return { volume, fees, disputeRate };
  }
}
