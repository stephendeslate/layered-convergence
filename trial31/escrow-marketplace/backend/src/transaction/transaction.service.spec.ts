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
      create: jest.fn(),
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
    it('should return transactions for a buyer', async () => {
      const transactions = [
        { id: 't1', amount: 1500, status: 'PENDING', buyerId: 'b1' },
      ];
      mockPrisma.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.findAllByBuyer('b1');
      expect(result).toEqual(transactions);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
        where: { buyerId: 'b1' },
        include: { seller: true, disputes: true },
        orderBy: { createdAt: 'desc' },
      });
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
        service.transitionStatus('missing', 'FUNDED'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('totalAmountByBuyerRaw', () => {
    it('should return total from raw query', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ total: 4500.50 }]);

      const result = await service.totalAmountByBuyerRaw('b1');
      expect(result).toBe(4500.50);
    });
  });

  describe('fundTransaction', () => {
    it('should execute raw update and return transaction', async () => {
      mockPrisma.$executeRaw.mockResolvedValue(1);
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'FUNDED',
      });

      const result = await service.fundTransaction('t1');
      expect(result).toEqual({ id: 't1', status: 'FUNDED' });
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
