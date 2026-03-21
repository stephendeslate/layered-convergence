import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyDashboard(companyId: string) {
    const [
      totalOrders,
      completedOrders,
      averageDuration,
      technicianCount,
      revenueTotal,
      statusBreakdown,
    ] = await Promise.all([
      this.prisma.workOrder.count({ where: { companyId } }),
      this.prisma.workOrder.count({ where: { companyId, status: 'COMPLETED' } }),
      this.prisma.workOrder.aggregate({
        where: { companyId, status: 'COMPLETED', estimatedDuration: { not: null } },
        _avg: { estimatedDuration: true },
      }),
      this.prisma.technician.count({ where: { companyId } }),
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'PAID' },
        _sum: { amount: true },
      }),
      this.getStatusBreakdown(companyId),
    ]);

    return {
      totalOrders,
      completedOrders,
      completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0.0',
      averageDuration: averageDuration._avg.estimatedDuration ?? 0,
      technicianCount,
      totalRevenue: revenueTotal._sum.amount ?? 0,
      statusBreakdown,
    };
  }

  async getTechnicianPerformance(companyId: string) {
    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      include: {
        workOrders: {
          select: { status: true, completedAt: true, createdAt: true },
        },
      },
    });

    return technicians.map((tech) => {
      const completed = tech.workOrders.filter((wo) => wo.status === 'COMPLETED' || wo.status === 'INVOICED' || wo.status === 'PAID');
      return {
        id: tech.id,
        name: tech.name,
        status: tech.status,
        totalAssigned: tech.workOrders.length,
        completed: completed.length,
        skills: tech.skills,
      };
    });
  }

  private async getStatusBreakdown(companyId: string) {
    const statuses = ['UNASSIGNED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID'];
    const counts = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.workOrder.count({ where: { companyId, status: status as never } }),
      })),
    );
    return counts;
  }
}
