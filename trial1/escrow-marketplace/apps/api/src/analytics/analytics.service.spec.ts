import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';

const mockPrisma = {
  transaction: {
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  dispute: {
    count: vi.fn(),
  },
  $queryRawUnsafe: vi.fn(),
};

const mockRedis = {
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue('OK'),
};

function createService() {
  return new AnalyticsService(mockPrisma as any, mockRedis as any);
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createService();
  });

  describe('getTransactionVolume', () => {
    it('should return volume grouped by day', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { period: '2026-03-01', count: BigInt(5), total_amount: BigInt(50000) },
        { period: '2026-03-02', count: BigInt(3), total_amount: BigInt(30000) },
      ]);

      const result = await service.getTransactionVolume(
        { from: new Date('2026-03-01'), to: new Date('2026-03-31') },
        'day',
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        period: '2026-03-01',
        count: 5,
        totalAmountCents: 50000,
      });
      expect(result[1].count).toBe(3);
    });

    it('should return volume grouped by month', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { period: '2026-03', count: BigInt(20), total_amount: BigInt(200000) },
      ]);

      const result = await service.getTransactionVolume(
        { from: new Date('2026-01-01'), to: new Date('2026-12-31') },
        'month',
      );

      expect(result).toHaveLength(1);
      expect(result[0].totalAmountCents).toBe(200000);
    });

    it('should handle empty results', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.getTransactionVolume(
        { from: new Date('2026-03-01'), to: new Date('2026-03-31') },
        'day',
      );

      expect(result).toEqual([]);
    });
  });

  describe('getPlatformFees', () => {
    it('should return aggregated platform fees', async () => {
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { platformFee: 15000, amount: 150000 },
        _count: 10,
      });

      const result = await service.getPlatformFees({
        from: new Date('2026-03-01'),
        to: new Date('2026-03-31'),
      });

      expect(result).toEqual({
        totalFeesCents: 15000,
        totalVolumeCents: 150000,
        transactionCount: 10,
      });
    });

    it('should handle zero fees', async () => {
      mockPrisma.transaction.aggregate.mockResolvedValue({
        _sum: { platformFee: null, amount: null },
        _count: 0,
      });

      const result = await service.getPlatformFees({
        from: new Date('2026-03-01'),
        to: new Date('2026-03-31'),
      });

      expect(result.totalFeesCents).toBe(0);
      expect(result.transactionCount).toBe(0);
    });
  });

  describe('getDisputeRate', () => {
    it('should calculate dispute rate', async () => {
      mockPrisma.transaction.count.mockResolvedValue(100);
      mockPrisma.dispute.count.mockResolvedValue(5);

      const result = await service.getDisputeRate({
        from: new Date('2026-03-01'),
        to: new Date('2026-03-31'),
      });

      expect(result).toEqual({
        totalTransactions: 100,
        disputedTransactions: 5,
        disputeRate: 0.05,
      });
    });

    it('should handle zero transactions', async () => {
      mockPrisma.transaction.count.mockResolvedValue(0);
      mockPrisma.dispute.count.mockResolvedValue(0);

      const result = await service.getDisputeRate({
        from: new Date('2026-03-01'),
        to: new Date('2026-03-31'),
      });

      expect(result.disputeRate).toBe(0);
    });
  });

  describe('getAverageHoldTime', () => {
    it('should return average hold time in hours', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { avg_hold_hours: 48.5 },
      ]);

      const result = await service.getAverageHoldTime({
        from: new Date('2026-03-01'),
        to: new Date('2026-03-31'),
      });

      expect(result.averageHoldHours).toBe(48.5);
    });

    it('should handle null when no data', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { avg_hold_hours: null },
      ]);

      const result = await service.getAverageHoldTime({
        from: new Date('2026-03-01'),
        to: new Date('2026-03-31'),
      });

      expect(result.averageHoldHours).toBeNull();
    });
  });

  describe('getProviderLeaderboard', () => {
    it('should return provider rankings by volume', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        {
          provider_id: 'p1',
          display_name: 'Top Provider',
          transaction_count: BigInt(50),
          total_volume: BigInt(500000),
          total_earned: BigInt(450000),
        },
        {
          provider_id: 'p2',
          display_name: 'Second Provider',
          transaction_count: BigInt(20),
          total_volume: BigInt(200000),
          total_earned: BigInt(180000),
        },
      ]);

      const result = await service.getProviderLeaderboard(10);

      expect(result).toHaveLength(2);
      expect(result[0].providerId).toBe('p1');
      expect(result[0].totalVolumeCents).toBe(500000);
      expect(result[1].transactionCount).toBe(20);
    });
  });

  describe('getOverviewMetrics', () => {
    it('should return overview for admin (no provider filter)', async () => {
      mockPrisma.transaction.count
        .mockResolvedValueOnce(100)  // totalTransactions
        .mockResolvedValueOnce(10);  // activeHolds
      mockPrisma.dispute.count.mockResolvedValue(3);
      mockPrisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { platformFee: 50000 } })  // totalFees
        .mockResolvedValueOnce({ _sum: { amount: 500000 } });     // totalVolume

      const result = await service.getOverviewMetrics();

      expect(result).toEqual({
        totalTransactions: 100,
        activeHolds: 10,
        openDisputes: 3,
        totalFeesCents: 50000,
        totalVolumeCents: 500000,
      });
    });

    it('should scope metrics to provider when providerId given', async () => {
      mockPrisma.transaction.count
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(2);
      mockPrisma.dispute.count.mockResolvedValue(1);
      mockPrisma.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { platformFee: 5000 } })
        .mockResolvedValueOnce({ _sum: { amount: 50000 } });

      const result = await service.getOverviewMetrics('provider-1');

      expect(result.totalTransactions).toBe(15);
      // Verify the count call included providerId
      expect(mockPrisma.transaction.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ providerId: 'provider-1' }),
        }),
      );
    });
  });
});
