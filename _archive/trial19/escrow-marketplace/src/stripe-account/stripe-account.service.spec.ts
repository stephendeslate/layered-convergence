import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StripeAccountService', () => {
  let service: StripeAccountService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      stripeConnectedAccount: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        StripeAccountService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(StripeAccountService);
  });

  describe('create', () => {
    it('should create a stripe connected account', async () => {
      prisma.stripeConnectedAccount.create.mockResolvedValue({
        id: 'sa1',
        userId: 'u1',
        stripeAccountId: 'acct_123',
      });

      const result = await service.create('u1', { stripeAccountId: 'acct_123' });
      expect(result.stripeAccountId).toBe('acct_123');
    });

    it('should include user relation', async () => {
      prisma.stripeConnectedAccount.create.mockResolvedValue({ id: 'sa1' });

      await service.create('u1', { stripeAccountId: 'acct_456' });
      expect(prisma.stripeConnectedAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { user: true },
        }),
      );
    });
  });

  describe('findByUser', () => {
    it('should return account by userId', async () => {
      prisma.stripeConnectedAccount.findUnique.mockResolvedValue({
        userId: 'u1',
        stripeAccountId: 'acct_123',
      });

      const result = await service.findByUser('u1');
      expect(result.stripeAccountId).toBe('acct_123');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.stripeConnectedAccount.findUnique.mockResolvedValue(null);
      await expect(service.findByUser('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboardingComplete to true', async () => {
      prisma.stripeConnectedAccount.update.mockResolvedValue({
        userId: 'u1',
        onboardingComplete: true,
      });

      const result = await service.completeOnboarding('u1');
      expect(result.onboardingComplete).toBe(true);
      expect(prisma.stripeConnectedAccount.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: { onboardingComplete: true },
        include: { user: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return all stripe accounts', async () => {
      prisma.stripeConnectedAccount.findMany.mockResolvedValue([
        { id: 'sa1' },
        { id: 'sa2' },
      ]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });
});
