import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsQuery {
  from?: string;
  to?: string;
  technicianId?: string;
  period?: 'day' | 'week' | 'month';
}

export interface JobMetrics {
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageCompletionMinutes: number;
  jobsByStatus: Record<string, number>;
}

export interface TechnicianUtilization {
  technicianId: string;
  technicianName: string;
  totalAssigned: number;
  completed: number;
  utilizationRate: number;
  averageCompletionMinutes: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  paidInvoices: number;
  outstandingAmount: number;
  averageInvoiceAmount: number;
}

export interface SlaMetrics {
  totalJobs: number;
  onTimeCompletions: number;
  lateCompletions: number;
  complianceRate: number;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Jobs per day/week/month metrics.
   */
  async getJobMetrics(companyId: string, query: AnalyticsQuery): Promise<JobMetrics> {
    const { from, to } = this.getDateRange(query);

    const where: any = {
      companyId,
      createdAt: { gte: from, lte: to },
    };
    if (query.technicianId) where.technicianId = query.technicianId;

    const workOrders = await this.prisma.workOrder.findMany({
      where,
      select: {
        status: true,
        actualStart: true,
        actualEnd: true,
        estimatedMinutes: true,
      },
    });

    const totalJobs = workOrders.length;
    const completedJobs = workOrders.filter(
      (wo) => wo.status === 'COMPLETED' || wo.status === 'INVOICED' || wo.status === 'PAID',
    ).length;
    const cancelledJobs = workOrders.filter((wo) => wo.status === 'CANCELLED').length;

    // Calculate average completion time for completed jobs
    const completedWithTimes = workOrders.filter(
      (wo) => wo.actualStart && wo.actualEnd,
    );
    const avgMinutes =
      completedWithTimes.length > 0
        ? completedWithTimes.reduce((sum, wo) => {
            const minutes =
              (wo.actualEnd!.getTime() - wo.actualStart!.getTime()) / 60000;
            return sum + minutes;
          }, 0) / completedWithTimes.length
        : 0;

    // Group by status
    const jobsByStatus: Record<string, number> = {};
    for (const wo of workOrders) {
      jobsByStatus[wo.status] = (jobsByStatus[wo.status] ?? 0) + 1;
    }

    return {
      totalJobs,
      completedJobs,
      cancelledJobs,
      averageCompletionMinutes: Math.round(avgMinutes),
      jobsByStatus,
    };
  }

  /**
   * Technician utilization rates.
   */
  async getTechnicianUtilization(
    companyId: string,
    query: AnalyticsQuery,
  ): Promise<TechnicianUtilization[]> {
    const { from, to } = this.getDateRange(query);

    const technicians = await this.prisma.technician.findMany({
      where: { companyId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        workOrders: {
          where: {
            createdAt: { gte: from, lte: to },
          },
          select: {
            status: true,
            actualStart: true,
            actualEnd: true,
          },
        },
      },
    });

    return technicians.map((tech) => {
      const totalAssigned = tech.workOrders.length;
      const completed = tech.workOrders.filter(
        (wo) => wo.status === 'COMPLETED' || wo.status === 'INVOICED' || wo.status === 'PAID',
      ).length;

      const completedWithTimes = tech.workOrders.filter(
        (wo) => wo.actualStart && wo.actualEnd,
      );
      const avgMinutes =
        completedWithTimes.length > 0
          ? completedWithTimes.reduce((sum, wo) => {
              const minutes =
                (wo.actualEnd!.getTime() - wo.actualStart!.getTime()) / 60000;
              return sum + minutes;
            }, 0) / completedWithTimes.length
          : 0;

      return {
        technicianId: tech.id,
        technicianName: `${tech.user.firstName} ${tech.user.lastName}`,
        totalAssigned,
        completed,
        utilizationRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
        averageCompletionMinutes: Math.round(avgMinutes),
      };
    });
  }

  /**
   * Revenue per period.
   */
  async getRevenueMetrics(
    companyId: string,
    query: AnalyticsQuery,
  ): Promise<RevenueMetrics> {
    const { from, to } = this.getDateRange(query);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        createdAt: { gte: from, lte: to },
      },
      select: {
        status: true,
        totalAmount: true,
      },
    });

    const paidInvoices = invoices.filter((inv) => inv.status === 'PAID');
    const totalRevenue = paidInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0,
    );

    const unpaidInvoices = invoices.filter(
      (inv) => inv.status === 'SENT' || inv.status === 'OVERDUE',
    );
    const outstandingAmount = unpaidInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount),
      0,
    );

    const averageInvoiceAmount =
      invoices.length > 0
        ? invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0) /
          invoices.length
        : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      paidInvoices: paidInvoices.length,
      outstandingAmount: Math.round(outstandingAmount * 100) / 100,
      averageInvoiceAmount: Math.round(averageInvoiceAmount * 100) / 100,
    };
  }

  /**
   * SLA compliance tracking.
   * A job is "on time" if it was completed within the estimated time window.
   */
  async getSlaMetrics(
    companyId: string,
    query: AnalyticsQuery,
  ): Promise<SlaMetrics> {
    const { from, to } = this.getDateRange(query);

    const workOrders = await this.prisma.workOrder.findMany({
      where: {
        companyId,
        createdAt: { gte: from, lte: to },
        status: { in: ['COMPLETED', 'INVOICED', 'PAID'] },
      },
      select: {
        scheduledEnd: true,
        actualEnd: true,
        estimatedMinutes: true,
        actualStart: true,
      },
    });

    const totalJobs = workOrders.length;
    let onTimeCompletions = 0;
    let lateCompletions = 0;

    for (const wo of workOrders) {
      if (wo.actualEnd && wo.scheduledEnd) {
        if (wo.actualEnd <= wo.scheduledEnd) {
          onTimeCompletions++;
        } else {
          lateCompletions++;
        }
      }
    }

    return {
      totalJobs,
      onTimeCompletions,
      lateCompletions,
      complianceRate:
        totalJobs > 0
          ? Math.round((onTimeCompletions / totalJobs) * 100)
          : 100,
    };
  }

  /**
   * Dashboard summary combining all metrics.
   */
  async getDashboard(companyId: string, query: AnalyticsQuery) {
    const [jobs, utilization, revenue, sla] = await Promise.all([
      this.getJobMetrics(companyId, query),
      this.getTechnicianUtilization(companyId, query),
      this.getRevenueMetrics(companyId, query),
      this.getSlaMetrics(companyId, query),
    ]);

    return { jobs, utilization, revenue, sla };
  }

  private getDateRange(query: AnalyticsQuery): { from: Date; to: Date } {
    const to = query.to ? new Date(query.to) : new Date();
    let from: Date;

    if (query.from) {
      from = new Date(query.from);
    } else {
      const period = query.period ?? 'month';
      from = new Date(to);
      switch (period) {
        case 'day':
          from.setDate(from.getDate() - 1);
          break;
        case 'week':
          from.setDate(from.getDate() - 7);
          break;
        case 'month':
        default:
          from.setMonth(from.getMonth() - 1);
          break;
      }
    }

    return { from, to };
  }
}
