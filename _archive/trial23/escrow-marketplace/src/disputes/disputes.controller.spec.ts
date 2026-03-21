import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DisputesController } from './disputes.controller';
import { UserRole, DisputeStatus } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  resolve: vi.fn(),
};

describe('DisputesController', () => {
  let controller: DisputesController;
  const buyerUser: RequestUser = { sub: 'buyer-1', email: 'b@test.com', role: UserRole.BUYER, tenantId: 't-1' };
  const adminUser: RequestUser = { sub: 'admin-1', email: 'a@test.com', role: UserRole.ADMIN, tenantId: 't-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DisputesController(mockService as any);
  });

  describe('create', () => {
    it('should create a dispute', async () => {
      mockService.create.mockResolvedValue({ id: 'disp-1' });
      const result = await controller.create({ transactionId: 'tx-1', reason: 'Bad' }, buyerUser);
      expect(result.id).toBe('disp-1');
    });
  });

  describe('findAll', () => {
    it('should return disputes', async () => {
      mockService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });

    it('should pass filters', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll('tx-1', DisputeStatus.OPEN);
      expect(mockService.findAll).toHaveBeenCalledWith({ transactionId: 'tx-1', status: 'OPEN' });
    });
  });

  describe('findOne', () => {
    it('should return a dispute', async () => {
      mockService.findById.mockResolvedValue({ id: 'disp-1' });
      const result = await controller.findOne('disp-1');
      expect(result.id).toBe('disp-1');
    });
  });

  describe('resolve', () => {
    it('should resolve a dispute', async () => {
      mockService.resolve.mockResolvedValue({ id: 'disp-1', status: 'RESOLVED_BUYER' });
      const result = await controller.resolve(
        'disp-1',
        { status: DisputeStatus.RESOLVED_BUYER, resolution: 'Refund' },
        adminUser,
      );
      expect(result.status).toBe('RESOLVED_BUYER');
    });
  });
});
