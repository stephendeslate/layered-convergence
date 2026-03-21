import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { StripeAccountController } from './stripe-account.controller';
import { StripeAccountService } from './stripe-account.service';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

describe('StripeAccountController', () => {
  let controller: StripeAccountController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findByUser: vi.fn(),
      completeOnboarding: vi.fn(),
    };

    const module = await Test.createTestingModule({
      controllers: [StripeAccountController],
      providers: [
        { provide: StripeAccountService, useValue: service },
        { provide: PrismaService, useValue: {} },
        { provide: Reflector, useValue: new Reflector() },
      ],
    }).compile();

    controller = module.get(StripeAccountController);
  });

  it('should call create with user id and dto', async () => {
    const user = { id: 'u1' };
    service.create.mockResolvedValue({ id: 'sa1' });

    await controller.create(user, { stripeAccountId: 'acct_123' });
    expect(service.create).toHaveBeenCalledWith('u1', { stripeAccountId: 'acct_123' });
  });

  it('should call findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findByUser', async () => {
    service.findByUser.mockResolvedValue({ userId: 'u1' });
    const result = await controller.findByUser('u1');
    expect(result.userId).toBe('u1');
  });

  it('should call completeOnboarding', async () => {
    service.completeOnboarding.mockResolvedValue({ onboardingComplete: true });
    const result = await controller.completeOnboarding('u1');
    expect(result.onboardingComplete).toBe(true);
  });
});
