import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [totalTransactions, totalVolume, totalFees, activeDisputes] =
      await Promise.all([
        this.prisma.transaction.count(),
        this.prisma.transaction.aggregate({ _sum: { amount: true } }),
        this.prisma.transaction.aggregate({ _sum: { platformFee: true } }),
        this.prisma.dispute.count({
          where: {
            status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
          },
        }),
      ]);

    const statusBreakdown = await this.prisma.transaction.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      totalTransactions,
      totalVolume: totalVolume._sum.amount ?? 0,
      totalFees: totalFees._sum.platformFee ?? 0,
      activeDisputes,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }

  async getDisputeRate() {
    const [total, disputed] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({
        where: {
          status: {
            in: [TransactionStatus.DISPUTED, TransactionStatus.REFUNDED],
          },
        },
      }),
    ]);

    return {
      total,
      disputed,
      rate: total > 0 ? (disputed / total) * 100 : 0,
    };
  }
}
