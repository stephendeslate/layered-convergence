import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayoutsController } from './payouts.controller';

const mockPayoutsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn(),
  getProviderPayoutSummary: vi.fn(),
};

const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-1' };
const providerUser = { sub: 'prov-1', email: 'prov@test.com', role: 'PROVIDER', tenantId: 'tenant-1' };

describe('PayoutsController', () => {
  let controller: PayoutsController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PayoutsController(mockPayoutsService as any);
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { transactionId: 'tx-1', amount: 5000 };
      mockPayoutsService.create.mockResolvedValue({ id: 'p-1' });

      await controller.create(dto as any, adminUser as any);

      expect(mockPayoutsService.create).toHaveBeenCalledWith(dto, 'admin-1');
    });
  });

  describe('findAll', () => {
    it('should filter by providerId for PROVIDER role', async () => {
      mockPayoutsService.findAll.mockResolvedValue([]);
      await controller.findAll(providerUser as any);
      expect(mockPayoutsService.findAll).toHaveBeenCalledWith('prov-1');
    });

    it('should not filter for ADMIN role', async () => {
      mockPayoutsService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser as any);
      expect(mockPayoutsService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('getSummary', () => {
    it('should call service.getProviderPayoutSummary', async () => {
      mockPayoutsService.getProviderPayoutSummary.mockResolvedValue({ totalPaid: 0, totalPending: 0, count: 0 });
      await controller.getSummary(providerUser as any);
      expect(mockPayoutsService.getProviderPayoutSummary).toHaveBeenCalledWith('prov-1');
    });
  });

  describe('findOne', () => {
    it('should call service.findById', async () => {
      mockPayoutsService.findById.mockResolvedValue({ id: 'p-1' });
      await controller.findOne('p-1');
      expect(mockPayoutsService.findById).toHaveBeenCalledWith('p-1');
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus', async () => {
      mockPayoutsService.updateStatus.mockResolvedValue({ id: 'p-1', status: 'COMPLETED' });
      await controller.updateStatus('p-1', 'COMPLETED' as any);
      expect(mockPayoutsService.updateStatus).toHaveBeenCalledWith('p-1', 'COMPLETED');
    });
  });
});
