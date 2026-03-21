import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service.js';

describe('StripeAccountService', () => {
  let service: StripeAccountService;
  let prisma: {
    stripeConnectedAccount: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      stripeConnectedAccount: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };
    service = new StripeAccountService(prisma as any);
  });

  describe('create', () => {
    it('should create a stripe connected account', async () => {
      const dto = {
        userId: 'user-1',
        stripeAccountId: 'acct_123',
        onboardingStatus: 'PENDING' as const,
      };
      const expected = { id: 'sa-1', ...dto };
      prisma.stripeConnectedAccount.create.mockResolvedValue(expected);

      const result = await service.create(dto);

      expect(prisma.stripeConnectedAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          stripeAccountId: 'acct_123',
          onboardingStatus: 'PENDING',
        },
      });
      expect(result).toEqual(expected);
    });

    it('should create without explicit onboardingStatus', async () => {
      const dto = {
        userId: 'user-1',
        stripeAccountId: 'acct_123',
      };
      prisma.stripeConnectedAccount.create.mockResolvedValue({ id: 'sa-1', ...dto });

      await service.create(dto);

      expect(prisma.stripeConnectedAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          stripeAccountId: 'acct_123',
          onboardingStatus: undefined,
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('should return account when found', async () => {
      const account = { id: 'sa-1', userId: 'user-1', stripeAccountId: 'acct_123' };
      prisma.stripeConnectedAccount.findFirst.mockResolvedValue(account);

      const result = await service.findByUserId('user-1');

      expect(prisma.stripeConnectedAccount.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toEqual(account);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.stripeConnectedAccount.findFirst.mockResolvedValue(null);

      await expect(service.findByUserId('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findByUserId('nonexistent')).rejects.toThrow(
        'Stripe account not found',
      );
    });
  });

  describe('updateStatus', () => {
    it('should update onboardingStatus', async () => {
      const updated = { id: 'sa-1', onboardingStatus: 'ACTIVE' };
      prisma.stripeConnectedAccount.update.mockResolvedValue(updated);

      const result = await service.updateStatus('sa-1', 'ACTIVE' as any);

      expect(prisma.stripeConnectedAccount.update).toHaveBeenCalledWith({
        where: { id: 'sa-1' },
        data: { onboardingStatus: 'ACTIVE' },
      });
      expect(result).toEqual(updated);
    });

    it('should update to RESTRICTED status', async () => {
      const updated = { id: 'sa-1', onboardingStatus: 'RESTRICTED' };
      prisma.stripeConnectedAccount.update.mockResolvedValue(updated);

      const result = await service.updateStatus('sa-1', 'RESTRICTED' as any);

      expect(prisma.stripeConnectedAccount.update).toHaveBeenCalledWith({
        where: { id: 'sa-1' },
        data: { onboardingStatus: 'RESTRICTED' },
      });
      expect(result).toEqual(updated);
    });
  });
});
