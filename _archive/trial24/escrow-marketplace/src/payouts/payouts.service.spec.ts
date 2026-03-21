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
    it('should create a payout with PENDING status', async () => {
      const dto = { transactionId: 'tx-1', amount: 5000 };
      mockPrisma.payout.create.mockResolvedValue({ id: 'p-1', status: 'PENDING', amount: 5000 });

      const result = await service.create(dto as any, 'prov-1');

      expect(result.status).toBe('PENDING');
      const createCall = mockPrisma.payout.create.mock.calls[0][0];
      expect(createCall.data.providerId).toBe('prov-1');
    });
  });

  describe('findAll', () => {
    it('should return all payouts when no providerId', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);
      await service.findAll();
      const call = mockPrisma.payout.findMany.mock.calls[0][0];
      expect(call.where).toEqual({});
    });

    it('should filter by providerId when provided', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([]);
      await service.findAll('prov-1');
      const call = mockPrisma.payout.findMany.mock.calls[0][0];
      expect(call.where.providerId).toBe('prov-1');
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
      await expect(service.findById('none')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({ id: 'p-1' });
      mockPrisma.payout.update.mockResolvedValue({ id: 'p-1', status: 'COMPLETED' });

      const result = await service.updateStatus('p-1', 'COMPLETED' as any);
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('getProviderPayoutSummary', () => {
    it('should calculate summary correctly', async () => {
      mockPrisma.payout.findMany.mockResolvedValue([
        { amount: 1000, status: 'COMPLETED' },
        { amount: 2000, status: 'PENDING' },
        { amount: 500, status: 'PROCESSING' },
        { amount: 300, status: 'FAILED' },
      ]);

      const result = await service.getProviderPayoutSummary('prov-1');

      expect(result.totalPaid).toBe(1000);
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
