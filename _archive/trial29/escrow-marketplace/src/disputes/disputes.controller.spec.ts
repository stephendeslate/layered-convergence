import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DisputesController } from './disputes.controller';

const mockDisputesService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  resolve: vi.fn(),
};

describe('DisputesController', () => {
  let controller: DisputesController;

  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER', tenantId: 'tenant-1' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN', tenantId: 'tenant-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DisputesController(mockDisputesService as any);
  });

  describe('create', () => {
    it('should call service.create with dto and user sub', async () => {
      const dto = { transactionId: 'tx-1', reason: 'Bad service' };
      mockDisputesService.create.mockResolvedValue({ id: 'd-1' });

      await controller.create(dto as any, buyerUser as any);
      expect(mockDisputesService.create).toHaveBeenCalledWith(dto, 'buyer-1');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with filters', async () => {
      mockDisputesService.findAll.mockResolvedValue([]);
      await controller.findAll('tx-1', 'OPEN' as any);
      expect(mockDisputesService.findAll).toHaveBeenCalledWith({ transactionId: 'tx-1', status: 'OPEN' });
    });

    it('should call service.findAll without filters', async () => {
      mockDisputesService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockDisputesService.findAll).toHaveBeenCalledWith({ transactionId: undefined, status: undefined });
    });
  });

  describe('findOne', () => {
    it('should call service.findById', async () => {
      mockDisputesService.findById.mockResolvedValue({ id: 'd-1' });
      await controller.findOne('d-1');
      expect(mockDisputesService.findById).toHaveBeenCalledWith('d-1');
    });
  });

  describe('resolve', () => {
    it('should call service.resolve with id, dto, and admin sub', async () => {
      const dto = { status: 'RESOLVED_PROVIDER', resolution: 'Provider wins' };
      mockDisputesService.resolve.mockResolvedValue({ id: 'd-1' });

      await controller.resolve('d-1', dto as any, adminUser as any);
      expect(mockDisputesService.resolve).toHaveBeenCalledWith('d-1', dto, 'admin-1');
    });
  });
});
