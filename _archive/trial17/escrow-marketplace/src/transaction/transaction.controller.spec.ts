import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionController } from './transaction.controller.js';

describe('TransactionController', () => {
  let controller: TransactionController;
  let transactionService: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    fund: ReturnType<typeof vi.fn>;
    deliver: ReturnType<typeof vi.fn>;
    release: ReturnType<typeof vi.fn>;
    dispute: ReturnType<typeof vi.fn>;
    refund: ReturnType<typeof vi.fn>;
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
      findAll: vi.fn(),
      fund: vi.fn(),
      deliver: vi.fn(),
      release: vi.fn(),
      dispute: vi.fn(),
      refund: vi.fn(),
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

  describe('findOne', () => {
    it('should delegate to transactionService.findById', async () => {
      const expected = { id: 'tx-1' };
      transactionService.findById.mockResolvedValue(expected);

      const result = await controller.findOne('tx-1');

      expect(transactionService.findById).toHaveBeenCalledWith('tx-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should delegate to transactionService.findAll with user', async () => {
      const expected = [{ id: 'tx-1' }];
      transactionService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockUser as any);

      expect(transactionService.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('fund', () => {
    it('should delegate to transactionService.fund', async () => {
      const expected = { id: 'tx-1', status: 'FUNDED' };
      transactionService.fund.mockResolvedValue(expected);

      const result = await controller.fund('tx-1', mockUser as any);

      expect(transactionService.fund).toHaveBeenCalledWith('tx-1', mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('deliver', () => {
    it('should delegate to transactionService.deliver', async () => {
      const expected = { id: 'tx-1', status: 'DELIVERED' };
      transactionService.deliver.mockResolvedValue(expected);

      const result = await controller.deliver('tx-1', mockUser as any);

      expect(transactionService.deliver).toHaveBeenCalledWith('tx-1', mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('release', () => {
    it('should delegate to transactionService.release', async () => {
      const expected = { id: 'tx-1', status: 'RELEASED' };
      transactionService.release.mockResolvedValue(expected);

      const result = await controller.release('tx-1', mockUser as any);

      expect(transactionService.release).toHaveBeenCalledWith('tx-1', mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('dispute', () => {
    it('should delegate to transactionService.dispute with reason', async () => {
      const expected = { id: 'tx-1', status: 'DISPUTED' };
      transactionService.dispute.mockResolvedValue(expected);

      const result = await controller.dispute('tx-1', { reason: 'Bad item' }, mockUser as any);

      expect(transactionService.dispute).toHaveBeenCalledWith('tx-1', mockUser, 'Bad item');
      expect(result).toEqual(expected);
    });

    it('should pass undefined reason when not provided', async () => {
      transactionService.dispute.mockResolvedValue({ id: 'tx-1' });

      await controller.dispute('tx-1', {}, mockUser as any);

      expect(transactionService.dispute).toHaveBeenCalledWith('tx-1', mockUser, undefined);
    });
  });

  describe('refund', () => {
    it('should delegate to transactionService.refund', async () => {
      const expected = { id: 'tx-1', status: 'REFUNDED' };
      transactionService.refund.mockResolvedValue(expected);

      const result = await controller.refund('tx-1', mockUser as any);

      expect(transactionService.refund).toHaveBeenCalledWith('tx-1', mockUser);
      expect(result).toEqual(expected);
    });
  });
});
