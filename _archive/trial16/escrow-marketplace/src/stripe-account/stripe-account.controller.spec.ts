import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeAccountController } from './stripe-account.controller.js';

describe('StripeAccountController', () => {
  let controller: StripeAccountController;
  let stripeAccountService: {
    create: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    stripeAccountService = {
      create: vi.fn(),
      findByUserId: vi.fn(),
      updateStatus: vi.fn(),
    };
    controller = new StripeAccountController(stripeAccountService as any);
  });

  describe('create', () => {
    it('should delegate to stripeAccountService.create', async () => {
      const dto = { userId: 'user-1', stripeAccountId: 'acct_123' };
      const expected = { id: 'sa-1', ...dto };
      stripeAccountService.create.mockResolvedValue(expected);

      const result = await controller.create(dto as any);

      expect(stripeAccountService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findByUserId', () => {
    it('should delegate to stripeAccountService.findByUserId', async () => {
      const expected = { id: 'sa-1', userId: 'user-1' };
      stripeAccountService.findByUserId.mockResolvedValue(expected);

      const result = await controller.findByUserId('user-1');

      expect(stripeAccountService.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });

  describe('updateStatus', () => {
    it('should delegate to stripeAccountService.updateStatus', async () => {
      const dto = { onboardingStatus: 'ACTIVE' as const };
      const expected = { id: 'sa-1', onboardingStatus: 'ACTIVE' };
      stripeAccountService.updateStatus.mockResolvedValue(expected);

      const result = await controller.updateStatus('sa-1', dto as any);

      expect(stripeAccountService.updateStatus).toHaveBeenCalledWith('sa-1', 'ACTIVE');
      expect(result).toEqual(expected);
    });
  });
});
