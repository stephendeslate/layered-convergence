import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeController } from './dispute.controller';
import { DisputeService } from './dispute.service';
import { TransactionStatus, Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

describe('DisputeController', () => {
  let controller: DisputeController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    submitEvidence: ReturnType<typeof vi.fn>;
    resolve: ReturnType<typeof vi.fn>;
  };

  const buyerUser: JwtPayload = { sub: 'buyer-1', email: 'buyer@test.com', role: Role.BUYER };
  const adminUser: JwtPayload = { sub: 'admin-1', email: 'admin@test.com', role: Role.ADMIN };

  const mockDispute = {
    id: 'dispute-1',
    transactionId: 'txn-1',
    filedById: 'buyer-1',
    reason: 'Item not as described',
  };

  beforeEach(() => {
    service = {
      create: vi.fn().mockResolvedValue(mockDispute),
      findAll: vi.fn().mockResolvedValue([mockDispute]),
      findOne: vi.fn().mockResolvedValue(mockDispute),
      submitEvidence: vi.fn().mockResolvedValue(mockDispute),
      resolve: vi.fn().mockResolvedValue(mockDispute),
    };
    controller = new DisputeController(service as unknown as DisputeService);
  });

  describe('create', () => {
    it('should create a dispute', async () => {
      const dto = { transactionId: 'txn-1', reason: 'Item not as described' };
      const result = await controller.create(dto, buyerUser);
      expect(service.create).toHaveBeenCalledWith(dto, buyerUser);
      expect(result).toEqual(mockDispute);
    });
  });

  describe('findAll', () => {
    it('should return disputes', async () => {
      const result = await controller.findAll(buyerUser);
      expect(service.findAll).toHaveBeenCalledWith(buyerUser);
      expect(result).toEqual([mockDispute]);
    });
  });

  describe('findOne', () => {
    it('should return a dispute', async () => {
      const result = await controller.findOne('dispute-1', buyerUser);
      expect(service.findOne).toHaveBeenCalledWith('dispute-1', buyerUser);
      expect(result).toEqual(mockDispute);
    });
  });

  describe('submitEvidence', () => {
    it('should submit evidence', async () => {
      const dto = { description: 'Photo of damage' };
      const result = await controller.submitEvidence('dispute-1', dto, buyerUser);
      expect(service.submitEvidence).toHaveBeenCalledWith('dispute-1', dto, buyerUser);
      expect(result).toEqual(mockDispute);
    });
  });

  describe('resolve', () => {
    it('should resolve a dispute', async () => {
      const dto = { resolution: 'Buyer wins', outcome: TransactionStatus.REFUNDED };
      const result = await controller.resolve('dispute-1', dto, adminUser);
      expect(service.resolve).toHaveBeenCalledWith('dispute-1', dto, adminUser);
      expect(result).toEqual(mockDispute);
    });
  });
});
