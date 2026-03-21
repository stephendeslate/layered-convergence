import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeController } from './dispute.controller.js';

describe('DisputeController', () => {
  let controller: DisputeController;
  let disputeService: {
    findById: ReturnType<typeof vi.fn>;
    findByTransactionId: ReturnType<typeof vi.fn>;
    submitEvidence: ReturnType<typeof vi.fn>;
    resolve: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test',
    role: 'ADMIN',
  };

  beforeEach(() => {
    disputeService = {
      findById: vi.fn(),
      findByTransactionId: vi.fn(),
      submitEvidence: vi.fn(),
      resolve: vi.fn(),
    };
    controller = new DisputeController(disputeService as any);
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

  describe('findByTransactionId', () => {
    it('should delegate to disputeService.findByTransactionId', async () => {
      const expected = { id: 'dispute-1', transactionId: 'tx-1' };
      disputeService.findByTransactionId.mockResolvedValue(expected);

      const result = await controller.findByTransactionId('tx-1');

      expect(disputeService.findByTransactionId).toHaveBeenCalledWith('tx-1');
      expect(result).toEqual(expected);
    });
  });

  describe('submitEvidence', () => {
    it('should delegate to disputeService.submitEvidence', async () => {
      const expected = { id: 'dispute-1', evidence: 'photo.jpg' };
      disputeService.submitEvidence.mockResolvedValue(expected);

      const result = await controller.submitEvidence('dispute-1', { evidence: 'photo.jpg' });

      expect(disputeService.submitEvidence).toHaveBeenCalledWith('dispute-1', 'photo.jpg');
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
