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
    it('should calculate total volume and fees', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 10000, platformFee: 500, status: 'RELEASED' },
        { amount: 5000, platformFee: 250, status: 'HELD' },
      ]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.totalTransactions).toBe(2);
      expect(result.totalVolume).toBe(15000);
      expect(result.totalFees).toBe(750);
    });

    it('should group transactions by status', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 1000, platformFee: 50, status: 'RELEASED' },
        { amount: 2000, platformFee: 100, status: 'RELEASED' },
        { amount: 3000, platformFee: 150, status: 'HELD' },
      ]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.byStatus['RELEASED']).toBe(2);
      expect(result.byStatus['HELD']).toBe(1);
    });

    it('should return zeros for empty tenant', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getTransactionSummary('tenant-1');

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe(0);
      expect(result.totalFees).toBe(0);
    });
  });

  describe('getDisputeMetrics', () => {
    it('should calculate dispute rate', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { status: 'RELEASED', disputes: [] },
        { status: 'DISPUTED', disputes: [{ status: 'OPEN' }] },
        { status: 'HELD', disputes: [] },
      ]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.totalDisputes).toBe(1);
      expect(result.disputeRate).toBeCloseTo(1 / 3);
    });

    it('should count resolved disputes', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        {
          status: 'RELEASED',
          disputes: [
            { status: 'RESOLVED_PROVIDER' },
            { status: 'RESOLVED_BUYER' },
          ],
        },
        { status: 'DISPUTED', disputes: [{ status: 'OPEN' }] },
      ]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.totalDisputes).toBe(3);
      expect(result.resolvedDisputes).toBe(2);
      expect(result.openDisputes).toBe(1);
    });

    it('should return zero rate for no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getDisputeMetrics('tenant-1');

      expect(result.disputeRate).toBe(0);
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should separate released and pending revenue', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { platformFee: 500, status: 'RELEASED' },
        { platformFee: 250, status: 'HELD' },
        { platformFee: 300, status: 'RELEASED' },
      ]);

      const result = await service.getRevenueBreakdown('tenant-1');

      expect(result.totalRevenue).toBe(1050);
      expect(result.releasedRevenue).toBe(800);
      expect(result.pendingRevenue).toBe(250);
    });

    it('should return zeros when no revenue transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getRevenueBreakdown('tenant-1');

      expect(result.totalRevenue).toBe(0);
      expect(result.releasedRevenue).toBe(0);
      expect(result.pendingRevenue).toBe(0);
    });
  });
});
