import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';

const mockPrisma = {
  transaction: {
    findMany: vi.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyticsService(mockPrisma as any);
  });

  describe('getTransactionSummary', () => {
    it('should calculate summary correctly', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 10000, platformFee: 500, status: 'HELD' },
        { amount: 20000, platformFee: 1000, status: 'RELEASED' },
        { amount: 5000, platformFee: 250, status: 'RELEASED' },
      ]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.totalTransactions).toBe(3);
      expect(result.totalVolume).toBe(35000);
      expect(result.totalFees).toBe(1750);
      expect(result.byStatus).toEqual({ HELD: 1, RELEASED: 2 });
    });

    it('should return zeros for no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe(0);
      expect(result.totalFees).toBe(0);
      expect(result.byStatus).toEqual({});
    });

    it('should filter by tenantId', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      await service.getTransactionSummary('tenant-1');
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
      });
    });
  });

  describe('getDisputeMetrics', () => {
    it('should calculate dispute metrics correctly', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { status: 'RELEASED', disputes: [] },
        {
          status: 'DISPUTED',
          disputes: [
            { status: 'OPEN' },
            { status: 'RESOLVED_BUYER' },
          ],
        },
        { status: 'HELD', disputes: [{ status: 'RESOLVED_PROVIDER' }] },
      ]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.totalDisputes).toBe(3);
      expect(result.disputeRate).toBeCloseTo(2 / 3);
      expect(result.resolvedDisputes).toBe(2);
      expect(result.openDisputes).toBe(1);
    });

    it('should return zeros for no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.totalDisputes).toBe(0);
      expect(result.disputeRate).toBe(0);
      expect(result.resolvedDisputes).toBe(0);
      expect(result.openDisputes).toBe(0);
    });

    it('should include disputes relation in query', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      await service.getDisputeMetrics('tenant-1');
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { disputes: true },
      });
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should calculate revenue breakdown correctly', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { status: 'RELEASED', platformFee: 500 },
        { status: 'RELEASED', platformFee: 1000 },
        { status: 'HELD', platformFee: 300 },
      ]);

      const result = await service.getRevenueBreakdown('tenant-1');

      expect(result.totalRevenue).toBe(1800);
      expect(result.releasedRevenue).toBe(1500);
      expect(result.pendingRevenue).toBe(300);
    });

    it('should return zeros for no matching transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getRevenueBreakdown('tenant-1');

      expect(result.totalRevenue).toBe(0);
      expect(result.releasedRevenue).toBe(0);
      expect(result.pendingRevenue).toBe(0);
    });

    it('should filter by RELEASED and HELD statuses', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      await service.getRevenueBreakdown('tenant-1');
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          status: { in: ['RELEASED', 'HELD'] },
        },
      });
    });
  });
});
