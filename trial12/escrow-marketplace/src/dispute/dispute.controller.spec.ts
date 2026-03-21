import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeController } from './dispute.controller.js';

describe('DisputeController', () => {
  let controller: DisputeController;
  let disputeService: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    resolve: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test',
    role: 'BUYER',
  };

  beforeEach(() => {
    disputeService = {
      create: vi.fn(),
      findById: vi.fn(),
      resolve: vi.fn(),
    };
    controller = new DisputeController(disputeService as any);
  });

  describe('create', () => {
    it('should delegate to disputeService.create', async () => {
      const dto = { transactionId: 'tx-1', reason: 'Bad item' };
      const expected = { id: 'dispute-1' };
      disputeService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as any, mockUser as any);

      expect(disputeService.create).toHaveBeenCalledWith(dto, mockUser);
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('should delegate to disputeService.findById', async () => {
      const expected = { id: 'dispute-1' };
      disputeService.findById.mockResolvedValue(expected);

      const result = await controller.findById('dispute-1');

      expect(disputeService.findById).toHaveBeenCalledWith('dispute-1');
      expect(result).toEqual(expected);
    });
  });

  describe('resolve', () => {
    it('should delegate to disputeService.resolve', async () => {
      const dto = { resolution: 'BUYER_WINS' as const };
      const expected = { id: 'dispute-1', resolution: 'BUYER_WINS' };
      disputeService.resolve.mockResolvedValue(expected);

      const result = await controller.resolve('dispute-1', dto as any, mockUser as any);

      expect(disputeService.resolve).toHaveBeenCalledWith('dispute-1', dto, mockUser);
      expect(result).toEqual(expected);
    });
  });
});
