import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { StripeAccountService } from './stripe-account.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OnboardingStatus } from '../../generated/prisma/client.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('StripeAccountService', () => {
  let service: StripeAccountService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      stripeConnectedAccount: {
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

  describe('createAccount', () => {
    it('should create a stripe connected account', async () => {
      const expected = {
        id: 'sa-1',
        userId: 'user-1',
        stripeAccountId: 'acct_123',
        onboardingStatus: OnboardingStatus.PENDING,
      };
      prisma.stripeConnectedAccount.create.mockResolvedValue(expected);

      const result = await service.createAccount('user-1', 'acct_123');
      expect(result).toEqual(expected);
      expect(prisma.stripeConnectedAccount.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          stripeAccountId: 'acct_123',
          onboardingStatus: OnboardingStatus.PENDING,
        },
      });
    });
  });

  describe('getMyAccount', () => {
    it('should return the account for the user', async () => {
      const account = { id: 'sa-1', userId: 'user-1', stripeAccountId: 'acct_123' };
      prisma.stripeConnectedAccount.findUnique.mockResolvedValue(account);

      const result = await service.getMyAccount('user-1');
      expect(result).toEqual(account);
    });

    it('should throw NotFoundException if no account exists', async () => {
      prisma.stripeConnectedAccount.findUnique.mockResolvedValue(null);
      await expect(service.getMyAccount('user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOnboardingStatus', () => {
    it('should update the onboarding status', async () => {
      const account = { id: 'sa-1', onboardingStatus: OnboardingStatus.PENDING };
      prisma.stripeConnectedAccount.findUnique.mockResolvedValue(account);
      prisma.stripeConnectedAccount.update.mockResolvedValue({
        ...account,
        onboardingStatus: OnboardingStatus.ACTIVE,
      });

      const result = await service.updateOnboardingStatus('sa-1', OnboardingStatus.ACTIVE);
      expect(result.onboardingStatus).toBe(OnboardingStatus.ACTIVE);
    });

    it('should throw NotFoundException if account not found', async () => {
      prisma.stripeConnectedAccount.findUnique.mockResolvedValue(null);
      await expect(
        service.updateOnboardingStatus('bad-id', OnboardingStatus.ACTIVE),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
