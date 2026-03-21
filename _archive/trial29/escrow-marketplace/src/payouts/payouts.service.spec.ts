import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayoutsService } from './payouts.service';
import { NotFoundException } from '@nestjs/common';

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
    it('should create payout with PENDING status', async () => {
      const dto = { transactionId: 'tx-1', amount: 9500, stripeTransferId: 'tr_123' };
      mockPrisma.payout.create.mockResolvedValue({ id: 'p-1', status: 'PENDING' });

      const result = await service.create(dto, 'prov-1');

      expect(mockPrisma.payout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'PENDING',
          providerId: 'prov-1',
          amount: 9500,
        }),
        include: expect.any(Object),
      });
      expect(result.status).toBe('PENDING');
    });
  });

  describe('findAll', () => {
    it('should return all payouts when no providerId', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([{ id: 'p-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockPrisma.payout.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: {} }));
    });

    it('should filter by providerId when provided', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);
      await service.findAll('prov-1');
      expect(mockPrisma.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { providerId: 'prov-1' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return payout when found', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({ id: 'p-1' });
      const result = await service.findById('p-1');
      expect(result.id).toBe('p-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.findById('p-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({ id: 'p-1' });
      mockPrisma.payout.update.mockResolvedValue({ id: 'p-1', status: 'COMPLETED' });

      const result = await service.updateStatus('p-1', 'COMPLETED' as any);
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException when payout not found', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('p-999', 'COMPLETED' as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProviderPayoutSummary', () => {
    it('should calculate summary correctly', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([
        { amount: 1000, status: 'COMPLETED' },
        { amount: 2000, status: 'PENDING' },
        { amount: 500, status: 'PROCESSING' },
        { amount: 300, status: 'COMPLETED' },
      ]);

      const result = await service.getProviderPayoutSummary('prov-1');

      expect(result.totalPaid).toBe(1300);
      expect(result.totalPending).toBe(2500);
      expect(result.count).toBe(4);
    });

    it('should return zeros when no payouts', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);

      const result = await service.getProviderPayoutSummary('prov-1');

      expect(result.totalPaid).toBe(0);
      expect(result.totalPending).toBe(0);
      expect(result.count).toBe(0);
    });
  });
});
