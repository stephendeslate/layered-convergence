import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: any;

  const COMPANY_ID = 'company-1';
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      technician: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      invoice: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getJobMetrics', () => {
    it('should return zero metrics when no work orders', async () => {
      const result = await service.getJobMetrics(COMPANY_ID, { period: 'month' });

      expect(result.totalJobs).toBe(0);
      expect(result.completedJobs).toBe(0);
      expect(result.cancelledJobs).toBe(0);
      expect(result.averageCompletionMinutes).toBe(0);
    });

    it('should calculate metrics from work orders', async () => {
      prisma.workOrder.findMany.mockResolvedValue([
        { status: 'COMPLETED', actualStart: oneHourAgo, actualEnd: now, estimatedMinutes: 60 },
        { status: 'COMPLETED', actualStart: oneHourAgo, actualEnd: now, estimatedMinutes: 60 },
        { status: 'CANCELLED', actualStart: null, actualEnd: null, estimatedMinutes: 60 },
        { status: 'ASSIGNED', actualStart: null, actualEnd: null, estimatedMinutes: 60 },
      ]);

      const result = await service.getJobMetrics(COMPANY_ID, { period: 'month' });

      expect(result.totalJobs).toBe(4);
      expect(result.completedJobs).toBe(2);
      expect(result.cancelledJobs).toBe(1);
      expect(result.averageCompletionMinutes).toBe(60);
      expect(result.jobsByStatus.COMPLETED).toBe(2);
      expect(result.jobsByStatus.CANCELLED).toBe(1);
    });
  });

  describe('getTechnicianUtilization', () => {
    it('should calculate utilization per technician', async () => {
      prisma.technician.findMany.mockResolvedValue([
        {
          id: 'tech-1',
          user: { firstName: 'John', lastName: 'Doe' },
          workOrders: [
            { status: 'COMPLETED', actualStart: oneHourAgo, actualEnd: now },
            { status: 'COMPLETED', actualStart: oneHourAgo, actualEnd: now },
            { status: 'ASSIGNED', actualStart: null, actualEnd: null },
          ],
        },
      ]);

      const result = await service.getTechnicianUtilization(COMPANY_ID, { period: 'month' });

      expect(result).toHaveLength(1);
      expect(result[0].technicianId).toBe('tech-1');
      expect(result[0].totalAssigned).toBe(3);
      expect(result[0].completed).toBe(2);
      expect(result[0].utilizationRate).toBe(67);
    });

    it('should handle technicians with no work orders', async () => {
      prisma.technician.findMany.mockResolvedValue([
        {
          id: 'tech-1',
          user: { firstName: 'Jane', lastName: 'Smith' },
          workOrders: [],
        },
      ]);

      const result = await service.getTechnicianUtilization(COMPANY_ID, { period: 'week' });

      expect(result[0].utilizationRate).toBe(0);
      expect(result[0].averageCompletionMinutes).toBe(0);
    });
  });

  describe('getRevenueMetrics', () => {
    it('should calculate revenue from invoices', async () => {
      prisma.invoice.findMany.mockResolvedValue([
        { status: 'PAID', totalAmount: 150.00 },
        { status: 'PAID', totalAmount: 250.00 },
        { status: 'SENT', totalAmount: 100.00 },
      ]);

      const result = await service.getRevenueMetrics(COMPANY_ID, { period: 'month' });

      expect(result.totalRevenue).toBe(400.00);
      expect(result.paidInvoices).toBe(2);
      expect(result.outstandingAmount).toBe(100.00);
    });

    it('should return zero when no invoices', async () => {
      const result = await service.getRevenueMetrics(COMPANY_ID, { period: 'month' });

      expect(result.totalRevenue).toBe(0);
      expect(result.paidInvoices).toBe(0);
    });
  });

  describe('getSlaMetrics', () => {
    it('should calculate SLA compliance', async () => {
      const scheduledEnd = new Date(now.getTime() + 30 * 60 * 1000); // 30 min from now
      const lateEnd = new Date(scheduledEnd.getTime() + 60 * 60 * 1000); // 1 hour after scheduled

      prisma.workOrder.findMany.mockResolvedValue([
        { scheduledEnd, actualEnd: now, actualStart: oneHourAgo, estimatedMinutes: 60 },
        { scheduledEnd, actualEnd: lateEnd, actualStart: oneHourAgo, estimatedMinutes: 60 },
      ]);

      const result = await service.getSlaMetrics(COMPANY_ID, { period: 'month' });

      expect(result.totalJobs).toBe(2);
      expect(result.onTimeCompletions).toBe(1);
      expect(result.lateCompletions).toBe(1);
      expect(result.complianceRate).toBe(50);
    });
  });

  describe('getDashboard', () => {
    it('should combine all metrics', async () => {
      prisma.technician.findMany.mockResolvedValue([]);

      const result = await service.getDashboard(COMPANY_ID, { period: 'month' });

      expect(result).toHaveProperty('jobs');
      expect(result).toHaveProperty('utilization');
      expect(result).toHaveProperty('revenue');
      expect(result).toHaveProperty('sla');
    });
  });
});
