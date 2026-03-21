import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsController } from './analytics.controller';

const mockAnalyticsService = {
  getTransactionSummary: vi.fn(),
  getDisputeMetrics: vi.fn(),
  getRevenueBreakdown: vi.fn(),
};

const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-1' };

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AnalyticsController(mockAnalyticsService as any);
  });

  describe('getTransactionSummary', () => {
    it('should call service with tenantId', async () => {
      mockAnalyticsService.getTransactionSummary.mockResolvedValue({ totalTransactions: 0 });
      await controller.getTransactionSummary(adminUser as any);
      expect(mockAnalyticsService.getTransactionSummary).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('getDisputeMetrics', () => {
    it('should call service with tenantId', async () => {
      mockAnalyticsService.getDisputeMetrics.mockResolvedValue({ totalDisputes: 0 });
      await controller.getDisputeMetrics(adminUser as any);
      expect(mockAnalyticsService.getDisputeMetrics).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('getRevenueBreakdown', () => {
    it('should call service with tenantId', async () => {
      mockAnalyticsService.getRevenueBreakdown.mockResolvedValue({ totalRevenue: 0 });
      await controller.getRevenueBreakdown(adminUser as any);
      expect(mockAnalyticsService.getRevenueBreakdown).toHaveBeenCalledWith('tenant-1');
    });
  });
});
