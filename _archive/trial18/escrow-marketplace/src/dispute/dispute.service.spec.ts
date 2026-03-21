import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DisputeService } from './dispute.service.js';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: {
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let transactionService: {
    transition: ReturnType<typeof vi.fn>;
  };

  const adminUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin',
    role: 'ADMIN',
  };

  beforeEach(() => {
    prisma = {
      dispute: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };
    transactionService = {
      transition: vi.fn(),
    };
    service = new DisputeService(prisma as any, transactionService as any);
  });

  describe('findById', () => {
    it('should return dispute when found', async () => {
      const dispute = { id: 'dispute-1', transaction: {} };
      prisma.dispute.findFirst.mockResolvedValue(dispute);

      const result = await service.findById('dispute-1');

      expect(result).toEqual(dispute);
      expect(prisma.dispute.findFirst).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        include: { transaction: true },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dispute.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent')).rejects.toThrow('Dispute not found');
    });
  });

  describe('findByTransactionId', () => {
    it('should return dispute when found by transactionId', async () => {
      const dispute = { id: 'dispute-1', transactionId: 'tx-1', transaction: {} };
      prisma.dispute.findFirst.mockResolvedValue(dispute);

      const result = await service.findByTransactionId('tx-1');

      expect(result).toEqual(dispute);
      expect(prisma.dispute.findFirst).toHaveBeenCalledWith({
        where: { transactionId: 'tx-1' },
        include: { transaction: true },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dispute.findFirst.mockResolvedValue(null);

      await expect(service.findByTransactionId('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findByTransactionId('nonexistent')).rejects.toThrow(
        'Dispute not found for this transaction',
      );
    });
  });

  describe('submitEvidence', () => {
    it('should update the dispute with evidence', async () => {
      const dispute = { id: 'dispute-1', transactionId: 'tx-1' };
      prisma.dispute.findFirst.mockResolvedValue(dispute);
      const updated = { ...dispute, evidence: 'photo.jpg' };
      prisma.dispute.update.mockResolvedValue(updated);

      const result = await service.submitEvidence('dispute-1', 'photo.jpg');

      expect(prisma.dispute.update).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        data: { evidence: 'photo.jpg' },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if dispute not found', async () => {
      prisma.dispute.findFirst.mockResolvedValue(null);

      await expect(service.submitEvidence('nonexistent', 'evidence')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resolve', () => {
    const mockDispute = {
      id: 'dispute-1',
      transactionId: 'tx-1',
      transaction: { id: 'tx-1' },
    };

    it('should transition to REFUNDED when buyer wins', async () => {
      prisma.dispute.findFirst.mockResolvedValue(mockDispute);
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({ ...mockDispute, resolution: 'BUYER_WINS' });

      const result = await service.resolve(
        'dispute-1',
        { resolution: 'BUYER_WINS' as any },
        adminUser as any,
      );

      expect(transactionService.transition).toHaveBeenCalledWith(
        'tx-1',
        'REFUNDED',
        adminUser,
        'Dispute resolved: buyer wins',
      );
      expect(prisma.dispute.update).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        data: {
          resolution: 'BUYER_WINS',
          resolvedAt: expect.any(Date),
        },
      });
    });

    it('should transition to RELEASED when provider wins', async () => {
      prisma.dispute.findFirst.mockResolvedValue(mockDispute);
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({ ...mockDispute, resolution: 'PROVIDER_WINS' });

      await service.resolve(
        'dispute-1',
        { resolution: 'PROVIDER_WINS' as any },
        adminUser as any,
      );

      expect(transactionService.transition).toHaveBeenCalledWith(
        'tx-1',
        'RELEASED',
        adminUser,
        'Dispute resolved: provider wins',
      );
    });

    it('should not transition for ESCALATED resolution', async () => {
      prisma.dispute.findFirst.mockResolvedValue(mockDispute);
      prisma.dispute.update.mockResolvedValue({ ...mockDispute, resolution: 'ESCALATED' });

      await service.resolve(
        'dispute-1',
        { resolution: 'ESCALATED' as any },
        adminUser as any,
      );

      expect(transactionService.transition).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if dispute not found', async () => {
      prisma.dispute.findFirst.mockResolvedValue(null);

      await expect(
        service.resolve('nonexistent', { resolution: 'BUYER_WINS' as any }, adminUser as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not transition for PENDING resolution', async () => {
      prisma.dispute.findFirst.mockResolvedValue(mockDispute);
      prisma.dispute.update.mockResolvedValue({ ...mockDispute, resolution: 'PENDING' });

      await service.resolve(
        'dispute-1',
        { resolution: 'PENDING' as any },
        adminUser as any,
      );

      expect(transactionService.transition).not.toHaveBeenCalled();
    });

    it('should set resolvedAt date on resolution', async () => {
      prisma.dispute.findFirst.mockResolvedValue(mockDispute);
      prisma.dispute.update.mockResolvedValue({});

      await service.resolve(
        'dispute-1',
        { resolution: 'ESCALATED' as any },
        adminUser as any,
      );

      expect(prisma.dispute.update).toHaveBeenCalledWith({
        where: { id: 'dispute-1' },
        data: {
          resolution: 'ESCALATED',
          resolvedAt: expect.any(Date),
        },
      });
    });
  });
});
