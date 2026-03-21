import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsService } from './analytics.service';
import { TransactionStatus } from '@prisma/client';

const mockPrisma = {
  transaction: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyticsService(mockPrisma as any);
  });

  describe('getTransactionVolume', () => {
    it('should calculate total volume and count', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 5000, status: TransactionStatus.HELD, currency: 'usd' },
        { amount: 3000, status: TransactionStatus.RELEASED, currency: 'usd' },
        { amount: 2000, status: TransactionStatus.HELD, currency: 'usd' },
      ]);

      const result = await service.getTransactionVolume('tenant-1');
      expect(result.totalVolume).toBe(10000);
      expect(result.totalCount).toBe(3);
    });

    it('should group by status', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { amount: 5000, status: TransactionStatus.HELD, currency: 'usd' },
        { amount: 3000, status: TransactionStatus.HELD, currency: 'usd' },
        { amount: 2000, status: TransactionStatus.RELEASED, currency: 'usd' },
      ]);

      const result = await service.getTransactionVolume('tenant-1');
      expect(result.byStatus.HELD.count).toBe(2);
      expect(result.byStatus.HELD.volume).toBe(8000);
      expect(result.byStatus.RELEASED.count).toBe(1);
    });

    it('should return zero for no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      const result = await service.getTransactionVolume('tenant-1');
      expect(result.totalVolume).toBe(0);
      expect(result.totalCount).toBe(0);
    });
  });

  describe('getPlatformFees', () => {
    it('should calculate total fees from released transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { platformFee: 250 },
        { platformFee: 150 },
      ]);

      const result = await service.getPlatformFees('tenant-1');
      expect(result.totalFees).toBe(400);
      expect(result.transactionCount).toBe(2);
    });

    it('should return zero when no released transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      const result = await service.getPlatformFees('tenant-1');
      expect(result.totalFees).toBe(0);
    });
  });

  describe('getDisputeRate', () => {
    it('should calculate dispute rate', async () => {
      mockPrisma.transaction.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      const result = await service.getDisputeRate('tenant-1');
      expect(result.totalTransactions).toBe(100);
      expect(result.disputedTransactions).toBe(5);
      expect(result.disputeRate).toBe(5);
      expect(result.refundRate).toBe(3);
    });

    it('should return zero rates when no transactions', async () => {
      mockPrisma.transaction.count.mockResolvedValue(0);
      const result = await service.getDisputeRate('tenant-1');
      expect(result.disputeRate).toBe(0);
      expect(result.refundRate).toBe(0);
    });
  });

  describe('getDashboard', () => {
    it('should aggregate all analytics', async () => {
      mockPrisma.transaction.findMany
        .mockResolvedValueOnce([{ amount: 5000, status: 'HELD', currency: 'usd' }])
        .mockResolvedValueOnce([{ platformFee: 250 }]);
      mockPrisma.transaction.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(0);

      const result = await service.getDashboard('tenant-1');
      expect(result.volume).toBeDefined();
      expect(result.fees).toBeDefined();
      expect(result.disputeRate).toBeDefined();
    });
  });
});
