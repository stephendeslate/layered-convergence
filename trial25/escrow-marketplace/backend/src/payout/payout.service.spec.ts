import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:TS-004] Unit test for PayoutService with mocked dependencies
describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    payout: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let tenantContext: { setUserContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      payout: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    tenantContext = { setUserContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  it('should list payouts for a user', async () => {
    prisma.payout.findMany.mockResolvedValue([{ id: 'p-1' }]);
    const result = await service.findAll('user-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when payout not found', async () => {
    prisma.payout.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a payout', async () => {
    prisma.payout.create.mockResolvedValue({ id: 'p-1', amount: 100 });
    const result = await service.create({
      transactionId: 't-1',
      recipientId: 'user-1',
      amount: 100,
    });
    expect(result.amount).toBe(100);
  });
});
