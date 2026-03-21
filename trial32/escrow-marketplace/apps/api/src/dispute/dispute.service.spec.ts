import { Test, TestingModule } from '@nestjs/testing';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  dispute: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DisputeService', () => {
  let service: DisputeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dispute with OPEN status', async () => {
      mockPrismaService.dispute.create.mockResolvedValue({
        id: '1', reason: 'Bad quality', status: 'OPEN',
      });

      const result = await service.create({
        reason: 'Bad quality', transactionId: 'tx-1', filedById: 'u-1', tenantId: 'tenant-1',
      });

      expect(result.status).toBe('OPEN');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when dispute not found', async () => {
      mockPrismaService.dispute.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should allow OPEN -> UNDER_REVIEW', async () => {
      mockPrismaService.dispute.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', tenantId: 'tenant-1' });
      mockPrismaService.dispute.update.mockResolvedValue({ id: '1', status: 'UNDER_REVIEW' });

      const result = await service.transition('1', 'tenant-1', 'UNDER_REVIEW' as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED');

      expect(result.status).toBe('UNDER_REVIEW');
    });

    it('should allow UNDER_REVIEW -> RESOLVED with resolution', async () => {
      mockPrismaService.dispute.findFirst.mockResolvedValue({ id: '1', status: 'UNDER_REVIEW', tenantId: 'tenant-1' });
      mockPrismaService.dispute.update.mockResolvedValue({ id: '1', status: 'RESOLVED', resolution: 'Refund issued' });

      const result = await service.transition('1', 'tenant-1', 'RESOLVED' as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED', 'Refund issued');

      expect(result.status).toBe('RESOLVED');
    });

    it('should reject OPEN -> RESOLVED (invalid transition)', async () => {
      mockPrismaService.dispute.findFirst.mockResolvedValue({ id: '1', status: 'OPEN', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'RESOLVED' as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RESOLVED -> any (terminal state)', async () => {
      mockPrismaService.dispute.findFirst.mockResolvedValue({ id: '1', status: 'RESOLVED', tenantId: 'tenant-1' });

      await expect(
        service.transition('1', 'tenant-1', 'OPEN' as 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
