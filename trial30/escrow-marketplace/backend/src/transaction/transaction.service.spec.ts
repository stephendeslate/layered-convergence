import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma.service';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockPrisma = {
    transaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByBuyer', () => {
    it('should return transactions for a buyer ordered by createdAt desc', async () => {
      const transactions = [
        { id: 't1', amount: 5000, status: 'FUNDED' },
        { id: 't2', amount: 1200, status: 'PENDING' },
      ];
      mockPrisma.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.findAllByBuyer('buyer-1');

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { buyerId: 'buyer-1' },
        orderBy: { createdAt: 'desc' },
        include: { disputes: true },
      });
      expect(result).toEqual(transactions);
    });
  });

  describe('transitionStatus', () => {
    it('should allow PENDING -> FUNDED transition', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'PENDING',
      });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 't1',
        status: 'FUNDED',
      });

      const result = await service.transitionStatus('t1', 'FUNDED');

      expect(result.status).toBe('FUNDED');
    });

    it('should allow FUNDED -> DISPUTED transition', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'FUNDED',
      });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 't1',
        status: 'DISPUTED',
      });

      const result = await service.transitionStatus('t1', 'DISPUTED');

      expect(result.status).toBe('DISPUTED');
    });

    it('should reject invalid transition PENDING -> RELEASED', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'PENDING',
      });

      await expect(
        service.transitionStatus('t1', 'RELEASED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when transaction not found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('nonexistent', 'FUNDED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('totalByBuyerRaw', () => {
    it('should return total from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ total: '7500.00' }]);

      const result = await service.totalByBuyerRaw('buyer-1');

      expect(result).toBe(7500);
    });
  });

  describe('releaseFunds', () => {
    it('should execute raw update and return transaction', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'RELEASED',
      });

      const result = await service.releaseFunds('t1');

      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
      expect(result?.status).toBe('RELEASED');
    });
  });
});
