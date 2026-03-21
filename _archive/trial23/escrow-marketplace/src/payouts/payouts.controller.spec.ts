import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayoutsController } from './payouts.controller';
import { UserRole, PayoutStatus } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn(),
  getProviderPayoutSummary: vi.fn(),
};

describe('PayoutsController', () => {
  let controller: PayoutsController;
  const adminUser: RequestUser = { sub: 'admin-1', email: 'a@test.com', role: UserRole.ADMIN, tenantId: 't-1' };
  const providerUser: RequestUser = { sub: 'prov-1', email: 'p@test.com', role: UserRole.PROVIDER, tenantId: 't-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PayoutsController(mockService as any);
  });

  describe('create', () => {
    it('should create a payout', async () => {
      mockService.create.mockResolvedValue({ id: 'pay-1' });
      const result = await controller.create({ transactionId: 'tx-1', amount: 5000 }, adminUser);
      expect(result.id).toBe('pay-1');
    });
  });

  describe('findAll', () => {
    it('should return all payouts for admin', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser);
      expect(mockService.findAll).toHaveBeenCalledWith();
    });

    it('should filter by providerId for provider role', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(providerUser);
      expect(mockService.findAll).toHaveBeenCalledWith('prov-1');
    });
  });

  describe('getSummary', () => {
    it('should return summary for provider', async () => {
      mockService.getProviderPayoutSummary.mockResolvedValue({ totalPaid: 5000 });
      const result = await controller.getSummary(providerUser);
      expect(result.totalPaid).toBe(5000);
    });
  });

  describe('findOne', () => {
    it('should return payout by id', async () => {
      mockService.findById.mockResolvedValue({ id: 'pay-1' });
      const result = await controller.findOne('pay-1');
      expect(result.id).toBe('pay-1');
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      mockService.updateStatus.mockResolvedValue({ id: 'pay-1', status: 'COMPLETED' });
      const result = await controller.updateStatus('pay-1', PayoutStatus.COMPLETED);
      expect(result.status).toBe('COMPLETED');
    });
  });
});
