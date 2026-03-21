import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StripeAccountService', () => {
  let service: StripeAccountService;
  let prisma: {
    stripeAccount: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      stripeAccount: {
        create: vi.fn(),
        findUnique: vi.fn(),
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
    it('should create a new stripe account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);
      prisma.stripeAccount.create.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
        stripeAccountId: 'acct_123',
      });

      const result = await service.create('user-1', 'acct_123');
      expect(result.stripeAccountId).toBe('acct_123');
    });

    it('should throw ConflictException for existing account', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create('user-1', 'acct_123')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return account for user', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue({
        id: 'sa-1',
        userId: 'user-1',
      });

      const result = await service.findByUserId('user-1');
      expect(result.id).toBe('sa-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.stripeAccount.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update stripe account properties', async () => {
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
    });
  });
});
