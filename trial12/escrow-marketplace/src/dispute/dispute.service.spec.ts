import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DisputeService } from './dispute.service.js';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let transactionService: {
    transition: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test',
    role: 'BUYER',
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
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    };
    transactionService = {
      transition: vi.fn(),
    };
    service = new DisputeService(prisma as any, transactionService as any);
  });

  describe('create', () => {
    const dto = {
      transactionId: 'tx-1',
      reason: 'Item not as described',
    };

    it('should transition transaction to DISPUTED and create dispute', async () => {
      transactionService.transition.mockResolvedValue({});
      const dispute = { id: 'dispute-1', ...dto, raisedById: 'user-1' };
      prisma.dispute.create.mockResolvedValue(dispute);

      const result = await service.create(dto, mockUser as any);

      expect(transactionService.transition).toHaveBeenCalledWith(
        'tx-1',
        'DISPUTED',
        mockUser,
        'Item not as described',
      );
      expect(prisma.dispute.create).toHaveBeenCalledWith({
        data: {
          transactionId: 'tx-1',
          raisedById: 'user-1',
          reason: 'Item not as described',
          evidence: null,
        },
      });
      expect(result).toEqual(dispute);
    });

    it('should store evidence when provided', async () => {
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.create.mockResolvedValue({ id: 'dispute-1' });

      await service.create({ ...dto, evidence: 'photo.jpg' }, mockUser as any);

      expect(prisma.dispute.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ evidence: 'photo.jpg' }),
      });
    });

    it('should propagate error if transition fails', async () => {
      transactionService.transition.mockRejectedValue(new Error('Invalid transition'));

      await expect(service.create(dto, mockUser as any)).rejects.toThrow('Invalid transition');
      expect(prisma.dispute.create).not.toHaveBeenCalled();
    });
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
  });
});
