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
    it('should calculate transaction summary', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 10000, platformFee: 500, status: 'HELD' },
        { amount: 20000, platformFee: 1000, status: 'RELEASED' },
        { amount: 5000, platformFee: 250, status: 'RELEASED' },
      ]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.totalTransactions).toBe(3);
      expect(result.totalVolume).toBe(35000);
      expect(result.totalFees).toBe(1750);
      expect(result.byStatus.HELD).toBe(1);
      expect(result.byStatus.RELEASED).toBe(2);
    });

    it('should return zeros for empty data', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe(0);
      expect(result.totalFees).toBe(0);
    });
  });

  describe('getDisputeMetrics', () => {
    it('should calculate dispute metrics', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { status: 'DISPUTED', disputes: [{ status: 'OPEN' }] },
        { status: 'RELEASED', disputes: [] },
        { status: 'HELD', disputes: [{ status: 'RESOLVED_BUYER' }] },
      ]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.totalDisputes).toBe(2);
      expect(result.resolvedDisputes).toBe(1);
      expect(result.openDisputes).toBe(1);
    });

    it('should handle no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.totalDisputes).toBe(0);
      expect(result.disputeRate).toBe(0);
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should calculate revenue breakdown', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { status: 'RELEASED', platformFee: 500 },
        { status: 'RELEASED', platformFee: 300 },
        { status: 'HELD', platformFee: 200 },
      ]);

      const result = await service.getRevenueBreakdown('tenant-1');

      expect(result.totalRevenue).toBe(1000);
      expect(result.releasedRevenue).toBe(800);
      expect(result.pendingRevenue).toBe(200);
    });
  });
});
