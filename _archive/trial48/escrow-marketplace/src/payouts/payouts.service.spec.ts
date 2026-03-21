import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, PayoutStatus } from '@prisma/client';
import { PayoutsService } from './payouts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutsService', () => {
  let service: PayoutsService;
  let prisma: any;

  const mockPayout = {
    id: 'payout-1',
    providerId: 'provider-1',
    transactionId: 'txn-1',
    amount: 95,
    currency: 'USD',
    status: PayoutStatus.PENDING,
    processedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction = {
    id: 'txn-1',
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    amount: 100,
    status: TransactionStatus.RELEASED,
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        findUnique: vi.fn(),
      },
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create payout for released transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      prisma.payout.create.mockResolvedValue(mockPayout);

      const result = await service.create('provider-1', {
        transactionId: 'txn-1',
        amount: 95,
      });

      expect(result).toEqual(mockPayout);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.create('provider-1', { transactionId: 'bad', amount: 95 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-released transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.PAYMENT_HELD,
      });

      await expect(
        service.create('provider-1', { transactionId: 'txn-1', amount: 95 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if provider does not own transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(
        service.create('other-provider', { transactionId: 'txn-1', amount: 95 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all payouts for ADMIN', async () => {
      prisma.payout.findMany.mockResolvedValue([mockPayout]);

      const result = await service.findAll('admin-1', 'ADMIN');
      expect(result).toHaveLength(1);
    });

    it('should filter by providerId for PROVIDER', async () => {
      prisma.payout.findMany.mockResolvedValue([mockPayout]);

      await service.findAll('provider-1', 'PROVIDER');
      expect(prisma.payout.findMany).toHaveBeenCalledWith({
        where: { providerId: 'provider-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('findById', () => {
    it('should return payout by id', async () => {
      prisma.payout.findUnique.mockResolvedValue(mockPayout);

      const result = await service.findById('payout-1');
      expect(result).toEqual(mockPayout);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      prisma.payout.findUnique.mockResolvedValue(mockPayout);
      prisma.payout.update.mockResolvedValue({
        ...mockPayout,
        status: PayoutStatus.COMPLETED,
      });

      const result = await service.updateStatus('payout-1', PayoutStatus.COMPLETED);
      expect(prisma.payout.update).toHaveBeenCalledWith({
        where: { id: 'payout-1' },
        data: expect.objectContaining({ status: PayoutStatus.COMPLETED }),
      });
    });

    it('should set processedAt for COMPLETED status', async () => {
      prisma.payout.findUnique.mockResolvedValue(mockPayout);
      prisma.payout.update.mockResolvedValue({
        ...mockPayout,
        status: PayoutStatus.COMPLETED,
      });

      await service.updateStatus('payout-1', PayoutStatus.COMPLETED);
      expect(prisma.payout.update).toHaveBeenCalledWith({
        where: { id: 'payout-1' },
        data: expect.objectContaining({
          processedAt: expect.any(Date),
        }),
      });
    });

    it('should not set processedAt for non-COMPLETED status', async () => {
      prisma.payout.findUnique.mockResolvedValue(mockPayout);
      prisma.payout.update.mockResolvedValue({
        ...mockPayout,
        status: PayoutStatus.PROCESSING,
      });

      await service.updateStatus('payout-1', PayoutStatus.PROCESSING);
      expect(prisma.payout.update).toHaveBeenCalledWith({
        where: { id: 'payout-1' },
        data: expect.objectContaining({
          processedAt: undefined,
        }),
      });
    });

    it('should throw NotFoundException when payout not found', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('bad', PayoutStatus.COMPLETED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
