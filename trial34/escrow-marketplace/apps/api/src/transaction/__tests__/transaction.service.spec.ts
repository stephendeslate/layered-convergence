import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionService } from '../transaction.service';
import { PrismaService } from '../../prisma.service';

// TRACED: EM-TA-UNIT-003 — Transaction service unit tests
describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    setTenantContext: jest.Mock;
    transaction: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      setTenantContext: jest.fn(),
      transaction: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    const module = await Test.createTestingModule({
      providers: [TransactionService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(TransactionService);
  });

  it('should reject invalid status values', async () => {
    await expect(service.updateStatus('1', 'INVALID', 't1')).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid state transitions', async () => {
    prisma.transaction.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED' });
    await expect(service.updateStatus('1', 'FUNDED', 't1')).rejects.toThrow(BadRequestException);
  });

  it('should allow INITIATED -> FUNDED transition', async () => {
    prisma.transaction.findFirst.mockResolvedValue({ id: '1', status: 'INITIATED' });
    prisma.transaction.update.mockResolvedValue({ id: '1', status: 'FUNDED' });
    const result = await service.updateStatus('1', 'FUNDED', 't1');
    expect(result.status).toBe('FUNDED');
  });

  it('should throw NotFoundException when transaction not found', async () => {
    prisma.transaction.findFirst.mockResolvedValue(null);
    await expect(service.updateStatus('missing', 'FUNDED', 't1')).rejects.toThrow(NotFoundException);
  });
});
