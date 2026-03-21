import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionStatus, Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  const buyerUser: JwtPayload = { sub: 'buyer-1', email: 'buyer@test.com', role: Role.BUYER };

  const mockTxn = {
    id: 'txn-1',
    amount: 100,
    status: TransactionStatus.PENDING,
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
  };

  beforeEach(() => {
    service = {
      create: vi.fn().mockResolvedValue(mockTxn),
      findAll: vi.fn().mockResolvedValue([mockTxn]),
      findOne: vi.fn().mockResolvedValue(mockTxn),
      updateStatus: vi.fn().mockResolvedValue({ ...mockTxn, status: TransactionStatus.FUNDED }),
    };
    controller = new TransactionController(service as unknown as TransactionService);
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const dto = { amount: 100, description: 'Test', sellerId: 'seller-1' };
      const result = await controller.create(dto, buyerUser);
      expect(service.create).toHaveBeenCalledWith(dto, 'buyer-1');
      expect(result).toEqual(mockTxn);
    });
  });

  describe('findAll', () => {
    it('should return transactions for user', async () => {
      const result = await controller.findAll(buyerUser);
      expect(service.findAll).toHaveBeenCalledWith(buyerUser);
      expect(result).toEqual([mockTxn]);
    });
  });

  describe('findOne', () => {
    it('should return a single transaction', async () => {
      const result = await controller.findOne('txn-1', buyerUser);
      expect(service.findOne).toHaveBeenCalledWith('txn-1', buyerUser);
      expect(result).toEqual(mockTxn);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status', async () => {
      const dto = { status: TransactionStatus.FUNDED };
      const result = await controller.updateStatus('txn-1', dto, buyerUser);
      expect(service.updateStatus).toHaveBeenCalledWith('txn-1', TransactionStatus.FUNDED, buyerUser, undefined);
      expect(result.status).toBe(TransactionStatus.FUNDED);
    });

    it('should pass shippingInfo when provided', async () => {
      const dto = { status: TransactionStatus.SHIPPED, shippingInfo: { carrier: 'UPS' } };
      await controller.updateStatus('txn-1', dto, buyerUser);
      expect(service.updateStatus).toHaveBeenCalledWith('txn-1', TransactionStatus.SHIPPED, buyerUser, { carrier: 'UPS' });
    });
  });
});
