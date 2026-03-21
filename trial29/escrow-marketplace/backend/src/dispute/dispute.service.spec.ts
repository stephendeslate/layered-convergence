import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma.service';

describe('DisputeService', () => {
  let service: DisputeService;

  const mockPrisma = {
    dispute: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAllByTransaction returns disputes for transaction', async () => {
    const disputes = [
      { id: 'd1', reason: 'Quality issue', status: 'OPEN', transactionId: 'tx1' },
    ];
    mockPrisma.dispute.findMany.mockResolvedValue(disputes);

    const result = await service.findAllByTransaction('tx1');
    expect(result).toEqual(disputes);
    expect(mockPrisma.dispute.findMany).toHaveBeenCalledWith({
      where: { transactionId: 'tx1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('findById returns dispute when found', async () => {
    const dispute = { id: 'd1', reason: 'Quality issue', transaction: {} };
    mockPrisma.dispute.findFirst.mockResolvedValue(dispute);

    const result = await service.findById('d1');
    expect(result).toEqual(dispute);
  });

  it('findById throws NotFoundException when not found', async () => {
    mockPrisma.dispute.findFirst.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('transitionStatus validates state machine transitions', async () => {
    mockPrisma.dispute.findFirst.mockResolvedValue({
      id: 'd1',
      status: 'OPEN',
    });
    mockPrisma.dispute.update.mockResolvedValue({
      id: 'd1',
      status: 'UNDER_REVIEW',
    });

    const result = await service.transitionStatus('d1', 'UNDER_REVIEW');
    expect(result.status).toBe('UNDER_REVIEW');
  });

  it('transitionStatus rejects invalid transitions', async () => {
    mockPrisma.dispute.findFirst.mockResolvedValue({
      id: 'd1',
      status: 'RESOLVED',
    });

    await expect(
      service.transitionStatus('d1', 'OPEN'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus throws when dispute not found', async () => {
    mockPrisma.dispute.findFirst.mockResolvedValue(null);

    await expect(
      service.transitionStatus('missing', 'UNDER_REVIEW'),
    ).rejects.toThrow(BadRequestException);
  });

  it('transitionStatus includes resolution when resolving', async () => {
    mockPrisma.dispute.findFirst.mockResolvedValue({
      id: 'd1',
      status: 'UNDER_REVIEW',
    });
    mockPrisma.dispute.update.mockResolvedValue({
      id: 'd1',
      status: 'RESOLVED',
      resolution: 'Refund issued',
    });

    const result = await service.transitionStatus('d1', 'RESOLVED', 'Refund issued');
    expect(result.status).toBe('RESOLVED');
    expect(mockPrisma.dispute.update).toHaveBeenCalledWith({
      where: { id: 'd1' },
      data: { status: 'RESOLVED', resolution: 'Refund issued' },
    });
  });

  it('create creates a new dispute', async () => {
    const created = { id: 'd1', reason: 'Late delivery', transactionId: 'tx1' };
    mockPrisma.dispute.create.mockResolvedValue(created);

    const result = await service.create({
      reason: 'Late delivery',
      transactionId: 'tx1',
    });
    expect(result).toEqual(created);
  });
});
