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

  describe('findById', () => {
    it('should return dispute with relations', async () => {
      const dispute = { id: 'd1', reason: 'Late delivery', status: 'OPEN' };
      mockPrisma.dispute.findFirst.mockResolvedValue(dispute);

      const result = await service.findById('d1');
      expect(result).toEqual(dispute);
    });

    it('should throw NotFoundException when dispute not found', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('transitionStatus', () => {
    it('should allow OPEN -> UNDER_REVIEW transition', async () => {
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

    it('should allow UNDER_REVIEW -> RESOLVED with resolution', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue({
        id: 'd1',
        status: 'UNDER_REVIEW',
      });
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'd1',
        status: 'RESOLVED',
        resolution: 'Refund issued',
      });

      const result = await service.transitionStatus(
        'd1',
        'RESOLVED',
        'Refund issued',
      );
      expect(result.status).toBe('RESOLVED');
    });

    it('should reject invalid transition RESOLVED -> OPEN', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue({
        id: 'd1',
        status: 'RESOLVED',
      });

      await expect(
        service.transitionStatus('d1', 'OPEN'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when dispute not found', async () => {
      mockPrisma.dispute.findFirst.mockResolvedValue(null);

      await expect(
        service.transitionStatus('missing', 'UNDER_REVIEW'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
