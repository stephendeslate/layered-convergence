import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:TS-002] Unit test for TransactionService with mocked dependencies
describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    transaction: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let tenantContext: { setUserContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      transaction: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    tenantContext = { setUserContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it('should list transactions for a user', async () => {
    prisma.transaction.findMany.mockResolvedValue([{ id: 't-1' }]);
    const result = await service.findAll('user-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when transaction not found', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('should enforce state machine: PENDING can only go to FUNDED', async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: 't-1', status: 'PENDING', buyerId: 'user-1',
    });

    await expect(service.transition('t-1', 'user-1', 'COMPLETED')).rejects.toThrow(BadRequestException);
  });

  it('should allow valid transition PENDING -> FUNDED', async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: 't-1', status: 'PENDING', buyerId: 'user-1',
    });
    prisma.transaction.update.mockResolvedValue({ id: 't-1', status: 'FUNDED' });

    const result = await service.transition('t-1', 'user-1', 'FUNDED');
    expect(result.status).toBe('FUNDED');
  });
});
