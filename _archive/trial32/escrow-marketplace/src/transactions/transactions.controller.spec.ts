import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionsController } from './transactions.controller';

const mockTransactionsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  transition: vi.fn(),
  getStateHistory: vi.fn(),
};

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER', tenantId: 'tenant-1' };
  const providerUser = { sub: 'prov-1', email: 'prov@test.com', role: 'PROVIDER', tenantId: 'tenant-1' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TransactionsController(mockTransactionsService as any);
  });

  describe('create', () => {
    it('should call service.create with dto, user sub, and tenantId', async () => {
      const dto = { amount: 1000, providerId: 'p-1' };
      mockTransactionsService.create.mockResolvedValue({ id: 'tx-1' });

      await controller.create(dto as any, buyerUser as any);
      expect(mockTransactionsService.create).toHaveBeenCalledWith(dto, 'buyer-1', 'tenant-1');
    });
  });

  describe('findAll', () => {
    it('should filter by buyerId for BUYER role', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);
      await controller.findAll(buyerUser as any);

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith('tenant-1', expect.objectContaining({ buyerId: 'buyer-1' }));
    });

    it('should filter by providerId for PROVIDER role', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);
      await controller.findAll(providerUser as any);

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith('tenant-1', expect.objectContaining({ providerId: 'prov-1' }));
    });

    it('should not filter by user for ADMIN role', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser as any);

      const filters = mockTransactionsService.findAll.mock.calls[0][1];
      expect(filters.buyerId).toBeUndefined();
      expect(filters.providerId).toBeUndefined();
    });

    it('should pass status filter when provided', async () => {
      mockTransactionsService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser as any, 'HELD' as any);

      const filters = mockTransactionsService.findAll.mock.calls[0][1];
      expect(filters.status).toBe('HELD');
    });
  });

  describe('findOne', () => {
    it('should call findById with id and tenantId', async () => {
      mockTransactionsService.findById.mockResolvedValue({ id: 'tx-1' });
      await controller.findOne('tx-1', buyerUser as any);
      expect(mockTransactionsService.findById).toHaveBeenCalledWith('tx-1', 'tenant-1');
    });
  });

  describe('transition', () => {
    it('should call service.transition with all params', async () => {
      mockTransactionsService.transition.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      await controller.transition('tx-1', { status: 'HELD' } as any, buyerUser as any);
      expect(mockTransactionsService.transition).toHaveBeenCalledWith('tx-1', { status: 'HELD' }, 'buyer-1', 'tenant-1');
    });
  });

  describe('getHistory', () => {
    it('should call getStateHistory with id and tenantId', async () => {
      mockTransactionsService.getStateHistory.mockResolvedValue([]);
      await controller.getHistory('tx-1', buyerUser as any);
      expect(mockTransactionsService.getStateHistory).toHaveBeenCalledWith('tx-1', 'tenant-1');
    });
  });
});
