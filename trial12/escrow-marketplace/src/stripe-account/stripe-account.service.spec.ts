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
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      stripeConnectedAccount: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

  describe('update', () => {
    it('should update stripeAccountId when provided', async () => {
      const updated = { id: 'sa-1', stripeAccountId: 'acct_456' };
      prisma.stripeConnectedAccount.update.mockResolvedValue(updated);

      const result = await service.update('sa-1', { stripeAccountId: 'acct_456' });

      expect(prisma.stripeConnectedAccount.update).toHaveBeenCalledWith({
        where: { id: 'sa-1' },
        data: { stripeAccountId: 'acct_456' },
      });
      expect(result).toEqual(updated);
    });

    it('should update onboardingStatus when provided', async () => {
      const updated = { id: 'sa-1', onboardingStatus: 'ACTIVE' };
      prisma.stripeConnectedAccount.update.mockResolvedValue(updated);

      const result = await service.update('sa-1', { onboardingStatus: 'ACTIVE' as any });

      expect(prisma.stripeConnectedAccount.update).toHaveBeenCalledWith({
        where: { id: 'sa-1' },
        data: { onboardingStatus: 'ACTIVE' },
      });
      expect(result).toEqual(updated);
    });

    it('should pass empty data when no fields provided', async () => {
      prisma.stripeConnectedAccount.update.mockResolvedValue({ id: 'sa-1' });

      await service.update('sa-1', {});

      expect(prisma.stripeConnectedAccount.update).toHaveBeenCalledWith({
        where: { id: 'sa-1' },
        data: {},
      });
    });
  });

  describe('delete', () => {
    it('should delete the stripe account', async () => {
      const deleted = { id: 'sa-1' };
      prisma.stripeConnectedAccount.delete.mockResolvedValue(deleted);

      const result = await service.delete('sa-1');

      expect(prisma.stripeConnectedAccount.delete).toHaveBeenCalledWith({
        where: { id: 'sa-1' },
      });
      expect(result).toEqual(deleted);
    });
  });
});
