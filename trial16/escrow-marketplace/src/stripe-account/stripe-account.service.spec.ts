import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StripeAccountService', () => {
  let service: StripeAccountService;
  let prisma: {
    stripeAccount: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      stripeAccount: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeAccountService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<StripeAccountService>(StripeAccountService);
  });

  describe('create', () => {
    it('should create a stripe account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);
      prisma.stripeAccount.create.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        stripeAccountId: 'acct_123',
        chargesEnabled: false,
        payoutsEnabled: false,
      });

      const result = await service.create('user-1', 'acct_123');
      expect(result.stripeAccountId).toBe('acct_123');
      expect(result.chargesEnabled).toBe(false);
    });

    it('should reject duplicate stripe account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create('user-1', 'acct_123')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set charges and payouts disabled by default', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);
      prisma.stripeAccount.create.mockResolvedValue({
        id: 'sa-1',
        chargesEnabled: false,
        payoutsEnabled: false,
      });

      await service.create('user-1', 'acct_456');

      expect(prisma.stripeAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            chargesEnabled: false,
            payoutsEnabled: false,
          }),
        }),
      );
    });
  });

  describe('findByUserId', () => {
    it('should return stripe account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        stripeAccountId: 'acct_123',
      });

      const result = await service.findByUserId('user-1');
      expect(result.id).toBe('sa-1');
    });

    it('should throw NotFoundException', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update stripe account charges and payouts', async () => {
      prisma.stripeAccount.update.mockResolvedValue({
        id: 'sa-1',
        chargesEnabled: true,
        payoutsEnabled: true,
      });

      const result = await service.update('acct_123', {
        chargesEnabled: true,
        payoutsEnabled: true,
      });
      expect(result.chargesEnabled).toBe(true);
      expect(result.payoutsEnabled).toBe(true);
    });

    it('should update only specified fields', async () => {
      prisma.stripeAccount.update.mockResolvedValue({
        id: 'sa-1',
        chargesEnabled: true,
        payoutsEnabled: false,
      });

      await service.update('acct_123', { chargesEnabled: true });

      expect(prisma.stripeAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeAccountId: 'acct_123' },
        }),
      );
    });

    it('should handle detailsSubmitted field (ignored in DB)', async () => {
      prisma.stripeAccount.update.mockResolvedValue({
        id: 'sa-1',
        chargesEnabled: true,
        payoutsEnabled: true,
      });

      const result = await service.update('acct_123', {
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      });

      expect(result.chargesEnabled).toBe(true);
    });
  });
});
