import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DispatchAnalyticsQueryDto } from './dto/dispatch-analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(query: DispatchAnalyticsQueryDto) {
    const where = { companyId: query.companyId };

    const [totalOrders, completedOrders, technicians, avgCompletionTime] =
      await Promise.all([
        this.prisma.workOrder.count({ where }),
        this.prisma.workOrder.count({
          where: { ...where, status: 'COMPLETED' },
        }),
        this.prisma.technician.count({ where }),
        this.prisma.workOrder.findMany({
          where: { ...where, completedAt: { not: null }, startedAt: { not: null } },
          select: { startedAt: true, completedAt: true },
        }),
      ]);

    const avgMinutes =
      avgCompletionTime.length > 0
        ? avgCompletionTime.reduce((sum, wo) => {
            if (!wo.startedAt || !wo.completedAt) return sum;
            return (
              sum +
              (wo.completedAt.getTime() - wo.startedAt.getTime()) / 60000
            );
          }, 0) / avgCompletionTime.length
        : 0;

    const statusBreakdown = await this.prisma.workOrder.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    return {
      totalOrders,
      completedOrders,
      completionRate:
        totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      activeTechnicians: technicians,
      avgCompletionMinutes: Math.round(avgMinutes),
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count,
      })),
    };
  }
}
