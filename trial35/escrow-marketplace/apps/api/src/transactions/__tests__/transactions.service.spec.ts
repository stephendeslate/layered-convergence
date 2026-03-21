// TRACED: EM-TEST-003 — Transactions service unit tests
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../transactions.service';
import { PrismaService } from '../../prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: { transaction: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; count: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { transaction: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn(), update: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('create', () => {
    it('should create a transaction with generated ID', async () => {
      prisma.transaction.create.mockResolvedValue({ id: 'txn_abc12345', amount: '100.00' });

      const result = await service.create('tenant-1', 'user-1', { listingId: 'lst-1', amount: '100.00' });
      expect(result.id).toBeDefined();
      const createArg = prisma.transaction.create.mock.calls[0][0];
      expect(createArg.data.id).toMatch(/^txn_/);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transitions', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: '1', status: 'PENDING' });
      prisma.transaction.update.mockResolvedValue({ id: '1', status: 'ESCROWED' });

      const result = await service.updateStatus('tenant-1', '1', 'ESCROWED');
      expect(result.status).toBe('ESCROWED');
    });

    it('should reject invalid status transitions', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: '1', status: 'PENDING' });
      await expect(service.updateStatus('tenant-1', '1', 'RELEASED')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      await expect(service.updateStatus('tenant-1', 'x', 'ESCROWED')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: '1', amount: '50.00' }]);
      prisma.transaction.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
