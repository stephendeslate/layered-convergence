import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

describe('DisputesService', () => {
  let service: DisputesService;
  let prisma: any;
  let transactionsService: any;

  beforeEach(async () => {
    prisma = {
      dispute: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };

    transactionsService = {
      findOne: vi.fn(),
      transition: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionsService, useValue: transactionsService },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
  });

  describe('create', () => {
    it('should create dispute for HELD transaction', async () => {
      transactionsService.findOne.mockResolvedValue({
        id: 't1',
        status: 'HELD',
      });
      prisma.dispute.create.mockResolvedValue({ id: 'd1', status: 'OPEN' });
      transactionsService.transition.mockResolvedValue({});

      const result = await service.create('user-1', 'tenant-1', {
        transactionId: 't1',
        reason: 'Not received',
      });

      expect(result.status).toBe('OPEN');
    });

    it('should throw BadRequestException if transaction not HELD', async () => {
      transactionsService.findOne.mockResolvedValue({
        id: 't1',
        status: 'CREATED',
      });

      await expect(
        service.create('user-1', 'tenant-1', {
          transactionId: 't1',
          reason: 'Not received',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition transaction to DISPUTED', async () => {
      transactionsService.findOne.mockResolvedValue({
        id: 't1',
        status: 'HELD',
      });
      prisma.dispute.create.mockResolvedValue({ id: 'd1', status: 'OPEN' });
      transactionsService.transition.mockResolvedValue({});

      await service.create('user-1', 'tenant-1', {
        transactionId: 't1',
        reason: 'Not received',
      });

      expect(transactionsService.transition).toHaveBeenCalledWith(
        't1',
        'tenant-1',
        { toStatus: 'DISPUTED' },
        'user-1',
      );
    });
  });

  describe('findAll', () => {
    it('should return disputes for tenant', async () => {
      prisma.dispute.findMany.mockResolvedValue([{ id: 'd1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return dispute if found', async () => {
      prisma.dispute.findFirst.mockResolvedValue({ id: 'd1' });

      const result = await service.findOne('d1', 'tenant-1');

      expect(result.id).toBe('d1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.dispute.findFirst.mockResolvedValue(null);

      await expect(service.findOne('d1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resolve', () => {
    it('should resolve dispute in buyer favor', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        id: 'd1',
        status: 'OPEN',
        transactionId: 't1',
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'd1',
        status: 'RESOLVED_BUYER',
      });
      transactionsService.transition.mockResolvedValue({});

      const result = await service.resolve('d1', 'tenant-1', {
        status: 'RESOLVED_BUYER' as any,
        resolution: 'Buyer was right',
      }, 'admin-1');

      expect(result.status).toBe('RESOLVED_BUYER');
      expect(transactionsService.transition).toHaveBeenCalledWith(
        't1',
        'tenant-1',
        expect.objectContaining({ toStatus: 'RESOLVED_BUYER' }),
        'admin-1',
      );
    });

    it('should resolve dispute in provider favor', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        id: 'd1',
        status: 'UNDER_REVIEW',
        transactionId: 't1',
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'd1',
        status: 'RESOLVED_PROVIDER',
      });
      transactionsService.transition.mockResolvedValue({});

      const result = await service.resolve('d1', 'tenant-1', {
        status: 'RESOLVED_PROVIDER' as any,
        resolution: 'Provider delivered',
      }, 'admin-1');

      expect(result.status).toBe('RESOLVED_PROVIDER');
    });

    it('should throw BadRequestException for already resolved dispute', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        id: 'd1',
        status: 'RESOLVED_BUYER',
        transactionId: 't1',
      });

      await expect(
        service.resolve('d1', 'tenant-1', {
          status: 'RESOLVED_PROVIDER' as any,
          resolution: 'test',
        }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitEvidence', () => {
    it('should update evidence and status', async () => {
      prisma.dispute.findFirst.mockResolvedValue({ id: 'd1' });
      prisma.dispute.update.mockResolvedValue({
        id: 'd1',
        evidence: 'proof',
        status: 'EVIDENCE_SUBMITTED',
      });

      const result = await service.submitEvidence('d1', 'tenant-1', 'proof');

      expect(result.status).toBe('EVIDENCE_SUBMITTED');
    });
  });
});
