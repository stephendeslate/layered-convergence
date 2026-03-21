import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionController } from './transaction.controller.js';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByUser: ReturnType<typeof vi.fn>;
    transition: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test',
    role: 'BUYER',
  };

  beforeEach(() => {
    transactionService = {
      create: vi.fn(),
      findById: vi.fn(),
      findByUser: vi.fn(),
      transition: vi.fn(),
    };
    controller = new TransactionController(transactionService as any);
  });

  describe('create', () => {
    it('should delegate to transactionService.create with dto and user', async () => {
      const dto = { providerId: 'p-1', amount: 50 };
      const expected = { id: 'tx-1', ...dto };
      transactionService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as any, mockUser as any);

      expect(transactionService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should delegate to transactionService.findById', async () => {
      const expected = { id: 'tx-1' };
      transactionService.findById.mockResolvedValue(expected);

      const result = await controller.findById('tx-1');

      expect(transactionService.findById).toHaveBeenCalledWith('tx-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findByUser', () => {
    it('should delegate to transactionService.findByUser with user id', async () => {
      const expected = [{ id: 'tx-1' }];
      transactionService.findByUser.mockResolvedValue(expected);

      const result = await controller.findByUser(mockUser as any);

      expect(transactionService.findByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('transition', () => {
    it('should delegate to transactionService.transition with all params', async () => {
      const dto = { toState: 'FUNDED' as const, reason: 'Payment done' };
      const expected = { id: 'tx-1', status: 'FUNDED' };
      transactionService.transition.mockResolvedValue(expected);

      const result = await controller.transition('tx-1', dto as any, mockUser as any);

      expect(transactionService.transition).toHaveBeenCalledWith(
        'tx-1',
        'FUNDED',
        mockUser,
        'Payment done',
      );
      expect(result).toEqual(expected);
    });

    it('should pass undefined reason when not provided', async () => {
      const dto = { toState: 'FUNDED' as const };
      transactionService.transition.mockResolvedValue({ id: 'tx-1' });

      await controller.transition('tx-1', dto as any, mockUser as any);

      expect(transactionService.transition).toHaveBeenCalledWith(
        'tx-1',
        'FUNDED',
        mockUser,
        undefined,
      );
    });
  });
});
