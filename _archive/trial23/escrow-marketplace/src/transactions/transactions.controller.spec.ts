import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionStatus, UserRole } from '@prisma/client';
import { RequestUser } from '../common/interfaces/request-user.interface';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  transition: vi.fn(),
  getStateHistory: vi.fn(),
};

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const buyerUser: RequestUser = { sub: 'buyer-1', email: 'buyer@test.com', role: UserRole.BUYER, tenantId: 'tenant-1' };
  const providerUser: RequestUser = { sub: 'provider-1', email: 'provider@test.com', role: UserRole.PROVIDER, tenantId: 'tenant-1' };
  const adminUser: RequestUser = { sub: 'admin-1', email: 'admin@test.com', role: UserRole.ADMIN, tenantId: 'tenant-1' };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TransactionsController(mockService as any);
  });

  describe('create', () => {
    it('should create a transaction for buyer', async () => {
      const dto = { amount: 5000, providerId: 'p-1' };
      mockService.create.mockResolvedValue({ id: 'tx-1' });
      const result = await controller.create(dto, buyerUser);
      expect(result.id).toBe('tx-1');
      expect(mockService.create).toHaveBeenCalledWith(dto, 'buyer-1', 'tenant-1');
    });
  });

  describe('findAll', () => {
    it('should filter by buyerId for buyer role', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(buyerUser);
      expect(mockService.findAll).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({ buyerId: 'buyer-1' }),
      );
    });

    it('should filter by providerId for provider role', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(providerUser);
      expect(mockService.findAll).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({ providerId: 'provider-1' }),
      );
    });

    it('should not filter for admin role', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser);
      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', {});
    });

    it('should include status filter', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll(adminUser, TransactionStatus.HELD);
      expect(mockService.findAll).toHaveBeenCalledWith(
        'tenant-1',
        expect.objectContaining({ status: 'HELD' }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single transaction', async () => {
      mockService.findById.mockResolvedValue({ id: 'tx-1' });
      const result = await controller.findOne('tx-1', buyerUser);
      expect(result.id).toBe('tx-1');
    });
  });

  describe('transition', () => {
    it('should call service transition', async () => {
      const dto = { status: TransactionStatus.HELD };
      mockService.transition.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      const result = await controller.transition('tx-1', dto, buyerUser);
      expect(result.status).toBe('HELD');
    });
  });

  describe('getHistory', () => {
    it('should return state history', async () => {
      mockService.getStateHistory.mockResolvedValue([]);
      const result = await controller.getHistory('tx-1', buyerUser);
      expect(result).toEqual([]);
    });
  });
});
