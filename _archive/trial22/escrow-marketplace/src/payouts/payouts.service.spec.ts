import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutStatus } from '@prisma/client';

const mockPrisma = {
  payout: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('PayoutsService', () => {
  let service: PayoutsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PayoutsService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a payout', async () => {
      mockPrisma.payout.create.mockResolvedValue({
        id: 'pay-1', amount: 5000, status: 'PENDING', transaction: {}, provider: {},
      });

      const result = await service.create(
        { transactionId: 'tx-1', amount: 5000 },
        'provider-1',
      );
      expect(result.id).toBe('pay-1');
    });

    it('should set status to PENDING', async () => {
      mockPrisma.payout.create.mockResolvedValue({ id: 'pay-1', transaction: {}, provider: {} });

      await service.create({ transactionId: 'tx-1', amount: 5000 }, 'provider-1');
      expect(mockPrisma.payout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all payouts', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([{ id: 'pay-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by providerId', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);
      await service.findAll('provider-1');
      expect(mockPrisma.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { providerId: 'provider-1' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return payout when found', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({ id: 'pay-1', transaction: {}, provider: {} });
      const result = await service.findById('pay-1');
      expect(result.id).toBe('pay-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.findById('pay-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({ id: 'pay-1', transaction: {}, provider: {} });
      mockPrisma.payout.update.mockResolvedValue({ id: 'pay-1', status: 'COMPLETED' });

      const result = await service.updateStatus('pay-1', PayoutStatus.COMPLETED);
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('getProviderPayoutSummary', () => {
    it('should calculate summary correctly', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([
        { amount: 5000, status: PayoutStatus.COMPLETED },
        { amount: 3000, status: PayoutStatus.COMPLETED },
        { amount: 2000, status: PayoutStatus.PENDING },
        { amount: 1000, status: PayoutStatus.FAILED },
      ]);

      const result = await service.getProviderPayoutSummary('provider-1');
      expect(result.totalPaid).toBe(8000);
      expect(result.totalPending).toBe(2000);
      expect(result.count).toBe(4);
    });

    it('should return zero when no payouts', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);
      const result = await service.getProviderPayoutSummary('provider-1');
      expect(result.totalPaid).toBe(0);
      expect(result.totalPending).toBe(0);
      expect(result.count).toBe(0);
    });
  });
});
