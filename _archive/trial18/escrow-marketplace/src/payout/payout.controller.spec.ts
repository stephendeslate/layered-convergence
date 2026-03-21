import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutController } from './payout.controller.js';

describe('PayoutController', () => {
  let controller: PayoutController;
  let payoutService: {
    createByTransactionId: ReturnType<typeof vi.fn>;
    findByUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    payoutService = {
      createByTransactionId: vi.fn(),
      findByUser: vi.fn(),
    };
    controller = new PayoutController(payoutService as any);
  });

  describe('create', () => {
    it('should delegate to payoutService.createByTransactionId', async () => {
      const expected = { id: 'payout-1', transactionId: 'tx-1' };
      payoutService.createByTransactionId.mockResolvedValue(expected);

      const result = await controller.create('tx-1');

      expect(payoutService.createByTransactionId).toHaveBeenCalledWith('tx-1');
      expect(result).toEqual(expected);
    });
  });

  describe('findByUser', () => {
    it('should delegate to payoutService.findByUser', async () => {
      const expected = [{ id: 'payout-1' }];
      payoutService.findByUser.mockResolvedValue(expected);

      const result = await controller.findByUser('user-1');

      expect(payoutService.findByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });
});
