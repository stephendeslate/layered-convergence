import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  transaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction with PENDING status', async () => {
      mockPrismaService.transaction.create.mockResolvedValue({
        id: '1', amount: 100, currency: 'USD', status: 'PENDING',
      });

      const result = await service.create({
        amount: 100, currency: 'USD', buyerId: 'b1', sellerId: 's1',
        description: 'Test', tenantId: 'tenant-1',
      });

      expect(result.status).toBe('PENDING');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when transaction not found', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow PENDING -> FUNDED', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', tenantId: 'tenant-1' });
      mockPrismaService.transaction.update.mockResolvedValue({ id: '1', status: 'FUNDED' });

      const result = await service.transition('1', 'tenant-1', 'FUNDED' as 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED');

      expect(result.status).toBe('FUNDED');
    });

    it('should allow FUNDED -> DISPUTED', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: '1', status: 'FUNDED', tenantId: 'tenant-1' });
      mockPrismaService.transaction.update.mockResolvedValue({ id: '1', status: 'DISPUTED' });

      const result = await service.transition('1', 'tenant-1', 'DISPUTED' as 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED');

      expect(result.status).toBe('DISPUTED');
    });

    it('should reject PENDING -> RELEASED (invalid transition)', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: '1', status: 'PENDING', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'RELEASED' as 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RELEASED -> any (terminal state)', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: '1', status: 'RELEASED', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'FUNDED' as 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED -> any (terminal state)', async () => {
      mockPrismaService.transaction.findFirst.mockResolvedValue({ id: '1', status: 'REFUNDED', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'PENDING' as 'PENDING' | 'FUNDED' | 'RELEASED' | 'DISPUTED' | 'REFUNDED'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
