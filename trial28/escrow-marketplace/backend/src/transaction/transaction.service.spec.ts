import { Test, TestingModule } from '@nestjs/testing';
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
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
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

  it('findAll returns all transactions', async () => {
    const transactions = [{ id: '1', status: 'PENDING', amount: 100 }];
    mockPrisma.transaction.findMany.mockResolvedValue(transactions);

    const result = await service.findAll();
    expect(result).toEqual(transactions);
  });

  it('findById returns a transaction with relations', async () => {
    const tx = { id: '1', status: 'FUNDED', buyer: {}, seller: {}, disputes: [] };
    mockPrisma.transaction.findFirst.mockResolvedValue(tx);

    const result = await service.findById('1');
    expect(result).toEqual(tx);
  });

  it('transitionStatus updates transaction status', async () => {
    const updated = { id: '1', status: 'RELEASED' };
    mockPrisma.transaction.update.mockResolvedValue(updated);

    const result = await service.transitionStatus('1', 'RELEASED');
    expect(result).toEqual(updated);
  });

  it('releaseTransaction uses $executeRaw', async () => {
    const tx = { id: '1', status: 'RELEASED' };
    mockPrisma.$executeRaw.mockResolvedValue(1);
    mockPrisma.transaction.findFirst.mockResolvedValue(tx);

    const result = await service.releaseTransaction('1');
    expect(result).toEqual(tx);
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();
  });

  it('sumByStatus returns total amount', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ total: 2500 }]);

    const result = await service.sumByStatus('RELEASED');
    expect(result).toBe(2500);
  });
});
