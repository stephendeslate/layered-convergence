import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionStatus, UserRole } from '../../generated/prisma/client.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockBuyer = { id: 'buyer-1', email: 'buyer@test.com', name: 'Buyer', role: UserRole.BUYER, passwordHash: '', createdAt: new Date(), updatedAt: new Date() };
const mockProvider = { id: 'provider-1', email: 'provider@test.com', name: 'Provider', role: UserRole.PROVIDER, passwordHash: '', createdAt: new Date(), updatedAt: new Date() };
const mockAdmin = { id: 'admin-1', email: 'admin@test.com', name: 'Admin', role: UserRole.ADMIN, passwordHash: '', createdAt: new Date(), updatedAt: new Date() };

function makeTransaction(overrides: Partial<any> = {}) {
  return {
    id: 'tx-1',
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    amount: 100,
    currency: 'USD',
    status: TransactionStatus.PENDING,
    platformFeePercent: 10,
    holdUntil: null,
    stripePaymentIntentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    buyer: mockBuyer,
    provider: mockProvider,
    dispute: null,
    stateHistory: [],
    ...overrides,
  };
}

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
      dispute: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const created = makeTransaction();
      prisma.transaction.create.mockResolvedValue(created);

      const result = await service.create(
        { providerId: 'provider-1', amount: 100 },
        'buyer-1',
      );

      expect(result).toEqual(created);
      expect(prisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all transactions for admin', async () => {
      prisma.transaction.findMany.mockResolvedValue([makeTransaction()]);
      const result = await service.findAll(mockAdmin);
      expect(result).toHaveLength(1);
    });

    it('should return only buyer transactions for buyer', async () => {
      prisma.transaction.findMany.mockResolvedValue([makeTransaction()]);
      await service.findAll(mockBuyer);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { buyerId: 'buyer-1' } }),
      );
    });

    it('should return only provider transactions for provider', async () => {
      prisma.transaction.findMany.mockResolvedValue([makeTransaction()]);
      await service.findAll(mockProvider);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { providerId: 'provider-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      prisma.transaction.findUnique.mockResolvedValue(makeTransaction());
      const result = await service.findOne('tx-1');
      expect(result.id).toBe('tx-1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('state machine transitions', () => {
    it('should transition PENDING → FUNDED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.PENDING });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.FUNDED });

      const result = await service.fund('tx-1', mockBuyer);
      expect(result.status).toBe(TransactionStatus.FUNDED);
      expect(prisma.transactionStateHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromState: TransactionStatus.PENDING,
            toState: TransactionStatus.FUNDED,
          }),
        }),
      );
    });

    it('should transition FUNDED → DELIVERED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.FUNDED });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.DELIVERED });

      const result = await service.deliver('tx-1', mockProvider);
      expect(result.status).toBe(TransactionStatus.DELIVERED);
    });

    it('should transition DELIVERED → RELEASED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.DELIVERED });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.RELEASED });

      const result = await service.release('tx-1', mockBuyer);
      expect(result.status).toBe(TransactionStatus.RELEASED);
    });

    it('should transition FUNDED → DISPUTED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.FUNDED });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.DISPUTED });

      const result = await service.dispute('tx-1', mockBuyer, 'Bad quality');
      expect(result.status).toBe(TransactionStatus.DISPUTED);
      expect(prisma.dispute.create).toHaveBeenCalled();
    });

    it('should transition DELIVERED → DISPUTED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.DELIVERED });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.DISPUTED });

      const result = await service.dispute('tx-1', mockBuyer, 'Not as described');
      expect(result.status).toBe(TransactionStatus.DISPUTED);
    });

    it('should transition DISPUTED → REFUNDED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.DISPUTED });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.REFUNDED });

      const result = await service.refund('tx-1', mockAdmin);
      expect(result.status).toBe(TransactionStatus.REFUNDED);
    });

    it('should transition DISPUTED → RELEASED (admin resolves for provider)', async () => {
      const tx = makeTransaction({ status: TransactionStatus.DISPUTED });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.RELEASED });

      // Admin can release a disputed transaction
      const result = await service.release('tx-1', mockAdmin);
      expect(result.status).toBe(TransactionStatus.RELEASED);
    });

    it('should transition PENDING → EXPIRED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.PENDING });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.EXPIRED });

      const result = await service.expire('tx-1');
      expect(result.status).toBe(TransactionStatus.EXPIRED);
    });
  });

  describe('invalid state transitions', () => {
    it('should reject PENDING → RELEASED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.PENDING });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.release('tx-1', mockBuyer)).rejects.toThrow(BadRequestException);
    });

    it('should reject RELEASED → FUNDED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.RELEASED });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.fund('tx-1', mockBuyer)).rejects.toThrow(BadRequestException);
    });

    it('should reject EXPIRED → FUNDED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.EXPIRED });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.fund('tx-1', mockBuyer)).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED → RELEASED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.REFUNDED });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.release('tx-1', mockBuyer)).rejects.toThrow(BadRequestException);
    });

    it('should reject PENDING → DELIVERED', async () => {
      const tx = makeTransaction({ status: TransactionStatus.PENDING });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.deliver('tx-1', mockProvider)).rejects.toThrow(BadRequestException);
    });
  });

  describe('authorization', () => {
    it('should reject fund by non-buyer', async () => {
      const tx = makeTransaction({ status: TransactionStatus.PENDING });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.fund('tx-1', mockProvider)).rejects.toThrow(ForbiddenException);
    });

    it('should reject deliver by non-provider', async () => {
      const tx = makeTransaction({ status: TransactionStatus.FUNDED });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.deliver('tx-1', mockBuyer)).rejects.toThrow(ForbiddenException);
    });

    it('should reject refund by non-admin', async () => {
      const tx = makeTransaction({ status: TransactionStatus.DISPUTED });
      prisma.transaction.findUnique.mockResolvedValue(tx);

      await expect(service.refund('tx-1', mockBuyer)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to bypass participant check', async () => {
      const tx = makeTransaction({ status: TransactionStatus.PENDING });
      prisma.transaction.findUnique.mockResolvedValue(tx);
      prisma.transaction.update.mockResolvedValue({ ...tx, status: TransactionStatus.FUNDED });

      const result = await service.fund('tx-1', mockAdmin);
      expect(result.status).toBe(TransactionStatus.FUNDED);
    });
  });
});
