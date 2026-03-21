import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalyticsController } from './analytics.controller';
import { UserRole } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';

const mockService = {
  getTransactionVolume: vi.fn(),
  getPlatformFees: vi.fn(),
  getDisputeRate: vi.fn(),
  getDashboard: vi.fn(),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  const adminUser: RequestUser = { sub: 'admin-1', email: 'a@test.com', role: UserRole.ADMIN, tenantId: 't-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AnalyticsController(mockService as any);
  });

  describe('getVolume', () => {
    it('should return transaction volume', async () => {
      mockService.getTransactionVolume.mockResolvedValue({ totalVolume: 50000 });
      const result = await controller.getVolume(adminUser);
      expect(result.totalVolume).toBe(50000);
    });
  });

  describe('getFees', () => {
    it('should return platform fees', async () => {
      mockService.getPlatformFees.mockResolvedValue({ totalFees: 2500 });
      const result = await controller.getFees(adminUser);
      expect(result.totalFees).toBe(2500);
    });
  });

  describe('getDisputeRate', () => {
    it('should return dispute rate', async () => {
      mockService.getDisputeRate.mockResolvedValue({ disputeRate: 3.5 });
      const result = await controller.getDisputeRate(adminUser);
      expect(result.disputeRate).toBe(3.5);
    });
  });

  describe('getDashboard', () => {
    it('should return full dashboard data', async () => {
      mockService.getDashboard.mockResolvedValue({
        volume: {}, fees: {}, disputeRate: {},
      });
      const result = await controller.getDashboard(adminUser);
      expect(result.volume).toBeDefined();
      expect(result.fees).toBeDefined();
      expect(result.disputeRate).toBeDefined();
    });
  });
});
