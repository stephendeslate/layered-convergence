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

  describe('findByTransaction', () => {
    it('should return disputes for a transaction ordered by createdAt desc', async () => {
      const disputes = [
        { id: 'd1', reason: 'Not delivered', status: 'OPEN' },
        { id: 'd2', reason: 'Quality issue', status: 'RESOLVED' },
      ];
      mockPrisma.dispute.findMany.mockResolvedValue(disputes);

      const result = await service.findByTransaction('tx-1');

      expect(mockPrisma.dispute.findMany).toHaveBeenCalledWith({
        where: { transactionId: 'tx-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(disputes);
    });
  });

  describe('findById', () => {
    it('should return dispute with transaction included', async () => {
      const dispute = { id: 'd1', reason: 'Not delivered', transaction: { id: 'tx-1' } };
      mockPrisma.dispute.findFirst.mockResolvedValue(dispute);

      const result = await service.findById('d1');

      expect(result).toEqual(dispute);
    });

    it('should throw NotFoundException when dispute not found', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new dispute', async () => {
      const data = { reason: 'Not as described', transactionId: 'tx-1', filedById: 'user-1' };
      mockPrisma.dispute.create.mockResolvedValue({ id: 'd1', ...data, status: 'OPEN' });

      const result = await service.create(data);

      expect(result.status).toBe('OPEN');
      expect(mockPrisma.dispute.create).toHaveBeenCalled();
    });
  });

  describe('transitionStatus', () => {
    it('should allow OPEN -> UNDER_REVIEW transition', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue({ id: 'd1', status: 'OPEN' });
      mockPrisma.dispute.update.mockResolvedValue({ id: 'd1', status: 'UNDER_REVIEW' });

      const result = await service.transitionStatus('d1', 'UNDER_REVIEW');

      expect(result.status).toBe('UNDER_REVIEW');
    });

    it('should allow UNDER_REVIEW -> RESOLVED with resolution', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue({ id: 'd1', status: 'UNDER_REVIEW' });
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'd1',
        status: 'RESOLVED',
        resolution: 'Partial refund',
      });

      const result = await service.transitionStatus('d1', 'RESOLVED', 'Partial refund');

      expect(result.status).toBe('RESOLVED');
    });

    it('should reject invalid transition RESOLVED -> OPEN', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue({ id: 'd1', status: 'RESOLVED' });

      await expect(
        service.transitionStatus('d1', 'OPEN'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when dispute not found', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('nonexistent', 'UNDER_REVIEW'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
