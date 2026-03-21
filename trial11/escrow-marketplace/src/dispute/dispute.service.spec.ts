import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DisputeService } from './dispute.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionService } from '../transaction/transaction.service.js';
import { DisputeResolution, TransactionStatus, UserRole } from '../../generated/prisma/client.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockAdmin = { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: UserRole.ADMIN, passwordHash: '', createdAt: new Date(), updatedAt: new Date() };

function makeDispute(overrides: Partial<any> = {}) {
  return {
    id: 'dispute-1',
    transactionId: 'tx-1',
    raisedById: 'buyer-1',
    reason: 'Bad quality',
    evidence: null,
    resolution: DisputeResolution.PENDING,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    transaction: { id: 'tx-1', status: TransactionStatus.DISPUTED },
    raisedBy: { id: 'buyer-1', name: 'Buyer' },
    ...overrides,
  };
}

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      dispute: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      transaction: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionService, useValue: {} },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  describe('findById', () => {
    it('should return dispute by id', async () => {
      prisma.dispute.findUnique.mockResolvedValue(makeDispute());
      const result = await service.findById('dispute-1');
      expect(result.id).toBe('dispute-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTransactionId', () => {
    it('should return dispute by transaction id', async () => {
      prisma.dispute.findUnique.mockResolvedValue(makeDispute());
      const result = await service.findByTransactionId('tx-1');
      expect(result.transactionId).toBe('tx-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findByTransactionId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateEvidence', () => {
    it('should update evidence on pending dispute', async () => {
      const dispute = makeDispute();
      prisma.dispute.findUnique.mockResolvedValue(dispute);
      prisma.dispute.update.mockResolvedValue({ ...dispute, evidence: 'New evidence' });

      const result = await service.updateEvidence('dispute-1', 'New evidence');
      expect(result.evidence).toBe('New evidence');
    });

    it('should reject evidence update on resolved dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(
        makeDispute({ resolution: DisputeResolution.BUYER_WINS }),
      );

      await expect(service.updateEvidence('dispute-1', 'Evidence')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resolve', () => {
    it('should resolve dispute as BUYER_WINS and trigger refund', async () => {
      const dispute = makeDispute();
      prisma.dispute.findUnique.mockResolvedValue(dispute);
      prisma.dispute.update.mockResolvedValue({ ...dispute, resolution: DisputeResolution.BUYER_WINS });
      prisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.DISPUTED });
      prisma.transaction.update.mockResolvedValue({});

      const result = await service.resolve('dispute-1', DisputeResolution.BUYER_WINS, mockAdmin);
      expect(result.resolution).toBe(DisputeResolution.BUYER_WINS);
      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TransactionStatus.REFUNDED } }),
      );
    });

    it('should resolve dispute as PROVIDER_WINS and trigger release', async () => {
      const dispute = makeDispute();
      prisma.dispute.findUnique.mockResolvedValue(dispute);
      prisma.dispute.update.mockResolvedValue({ ...dispute, resolution: DisputeResolution.PROVIDER_WINS });
      prisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.DISPUTED });
      prisma.transaction.update.mockResolvedValue({});

      const result = await service.resolve('dispute-1', DisputeResolution.PROVIDER_WINS, mockAdmin);
      expect(result.resolution).toBe(DisputeResolution.PROVIDER_WINS);
      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: TransactionStatus.RELEASED } }),
      );
    });

    it('should reject resolving already resolved dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(
        makeDispute({ resolution: DisputeResolution.BUYER_WINS }),
      );

      await expect(
        service.resolve('dispute-1', DisputeResolution.PROVIDER_WINS, mockAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject resolving to PENDING', async () => {
      prisma.dispute.findUnique.mockResolvedValue(makeDispute());

      await expect(
        service.resolve('dispute-1', DisputeResolution.PENDING, mockAdmin),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
