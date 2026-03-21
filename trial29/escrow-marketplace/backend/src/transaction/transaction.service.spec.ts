import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma.service';

describe('TransactionService', () => {
  let service: TransactionService;

  const mockPrisma = {
    transaction: {
      findMany: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
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

  it('findAllByUser returns transactions for buyer or seller', async () => {
    const transactions = [
      { id: 'tx1', amount: 250, status: 'FUNDED', buyerId: 'u1', sellerId: 'u2', disputes: [] },
    ];
    mockPrisma.transaction.findMany.mockResolvedValue(transactions);

    const result = await service.findAllByUser('u1');
    expect(result).toEqual(transactions);
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith({
      where: { OR: [{ buyerId: 'u1' }, { sellerId: 'u1' }] },
      include: { disputes: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('transitionStatus validates state machine transitions', async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue({
      id: 'tx1',
      status: 'PENDING',
    });
    mockPrisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'FUNDED',
    });

    const result = await service.transitionStatus('tx1', 'FUNDED');
    expect(result.status).toBe('FUNDED');
  });

  it('transitionStatus rejects invalid transitions', async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue({
      id: 'tx1',
      status: 'RELEASED',
    });

    await expect(
      service.transitionStatus('tx1', 'FUNDED'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus throws when transaction not found', async () => {
    mockPrisma.transaction.findFirst.mockResolvedValue(null);

    await expect(
      service.transitionStatus('missing', 'FUNDED'),
    ).rejects.toThrow(BadRequestException);
  });

  it('totalByUserRaw returns total from raw SQL', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ total: 1250.5 }]);

    const total = await service.totalByUserRaw('u1');
    expect(total).toBe(1250.5);
  });

  it('fundTransaction uses $executeRaw and returns transaction', async () => {
    const transaction = { id: 'tx1', status: 'FUNDED' };
    mockPrisma.$executeRaw.mockResolvedValue(1);
    mockPrisma.transaction.findFirst.mockResolvedValue(transaction);

    const result = await service.fundTransaction('tx1');
    expect(result).toEqual(transaction);
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });
});
