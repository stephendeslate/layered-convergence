import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './admin.service';

const mockPrisma = {
  transaction: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  dispute: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  webhookLog: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
  payout: {
    count: vi.fn(),
  },
};

function createService() {
  return new AdminService(mockPrisma as any);
}

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createService();
  });

  // ─── getTransactions ───────────────────────────────────────────────────────

  describe('getTransactions', () => {
    it('should return paginated transactions without filter', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { id: 'txn-1', status: 'CREATED' },
        { id: 'txn-2', status: 'PAYMENT_HELD' },
      ]);
      mockPrisma.transaction.count.mockResolvedValue(2);

      const result = await service.getTransactions({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter transactions by status', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.getTransactions({ status: 'DISPUTED' as any });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'DISPUTED' },
        }),
      );
    });

    it('should use default pagination', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.getTransactions({});

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  // ─── getDisputes ──────────────────────────────────────────────────────────

  describe('getDisputes', () => {
    it('should return paginated disputes', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([
        { id: 'd-1', status: 'OPEN' },
      ]);
      mockPrisma.dispute.count.mockResolvedValue(1);

      const result = await service.getDisputes({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter disputes by status', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([]);
      mockPrisma.dispute.count.mockResolvedValue(0);

      await service.getDisputes({ status: 'OPEN' as any });

      expect(mockPrisma.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'OPEN' },
        }),
      );
    });
  });

  // ─── getProviders ─────────────────────────────────────────────────────────

  describe('getProviders', () => {
    it('should return providers list', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'p-1', displayName: 'Provider 1', role: 'PROVIDER' },
      ]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.getProviders({});

      expect(result.data).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'PROVIDER' }),
        }),
      );
    });

    it('should filter by onboarding status', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.getProviders({ onboardingStatus: 'COMPLETE' as any });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'PROVIDER',
            connectedAccount: { onboardingStatus: 'COMPLETE' },
          }),
        }),
      );
    });
  });

  // ─── getWebhookLogs ───────────────────────────────────────────────────────

  describe('getWebhookLogs', () => {
    it('should return webhook logs', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([
        { id: 'wh-1', eventType: 'payment_intent.succeeded', status: 'PROCESSED' },
      ]);
      mockPrisma.webhookLog.count.mockResolvedValue(1);

      const result = await service.getWebhookLogs({});

      expect(result.data).toHaveLength(1);
    });

    it('should filter by status and event type', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([]);
      mockPrisma.webhookLog.count.mockResolvedValue(0);

      await service.getWebhookLogs({
        status: 'FAILED' as any,
        eventType: 'payment_intent.succeeded',
      });

      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'FAILED', eventType: 'payment_intent.succeeded' },
        }),
      );
    });
  });

  // ─── getPlatformHealth ────────────────────────────────────────────────────

  describe('getPlatformHealth', () => {
    it('should return health metrics', async () => {
      mockPrisma.webhookLog.count
        .mockResolvedValueOnce(2)   // pending
        .mockResolvedValueOnce(1);  // failed
      mockPrisma.transaction.count.mockResolvedValueOnce(5); // active holds
      mockPrisma.dispute.count.mockResolvedValueOnce(3);     // open disputes
      mockPrisma.payout.count
        .mockResolvedValueOnce(1)   // pending payouts
        .mockResolvedValueOnce(0);  // failed payouts
      mockPrisma.user.count
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(30); // total providers

      const result = await service.getPlatformHealth();

      expect(result).toEqual(
        expect.objectContaining({
          pendingWebhooks: 2,
          failedWebhooks: 1,
          activeHolds: 5,
          openDisputes: 3,
          pendingPayouts: 1,
          failedPayouts: 0,
          totalUsers: 100,
          totalProviders: 30,
        }),
      );
      expect(result.timestamp).toBeDefined();
    });
  });
});
