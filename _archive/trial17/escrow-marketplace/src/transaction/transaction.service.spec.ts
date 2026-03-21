import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionService } from './transaction.service.js';

const buyer = {
  id: 'buyer-1',
  email: 'buyer@test.com',
  name: 'Buyer',
  role: 'BUYER',
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const provider = {
  id: 'provider-1',
  email: 'provider@test.com',
  name: 'Provider',
  role: 'PROVIDER',
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const admin = {
  id: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin',
  role: 'ADMIN',
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeTx(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tx-1',
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    amount: 100,
    currency: 'USD',
    status: 'PENDING',
    platformFeePercent: 10,
    stateHistory: [],
    dispute: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    transaction: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    transactionStateHistory: {
      create: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };
    service = new TransactionService(prisma as any);
  });

  describe('create', () => {
    const dto = { providerId: 'provider-1', amount: 100 };

    it('should create a transaction for a buyer', async () => {
      const expected = makeTx();
      prisma.transaction.create.mockResolvedValue(expected);

      const result = await service.create(dto, buyer as any);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          buyerId: 'buyer-1',
          providerId: 'provider-1',
          amount: 100,
          currency: 'USD',
        },
      });
      expect(result).toEqual(expected);
    });

    it('should use custom currency if provided', async () => {
      prisma.transaction.create.mockResolvedValue(makeTx({ currency: 'EUR' }));

      await service.create({ ...dto, currency: 'EUR' }, buyer as any);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ currency: 'EUR' }),
      });
    });

    it('should throw ForbiddenException if user is not a buyer', async () => {
      await expect(service.create(dto, provider as any)).rejects.toThrow(ForbiddenException);
      await expect(service.create(dto, provider as any)).rejects.toThrow(
        'Only buyers can create transactions',
      );
    });

    it('should throw ForbiddenException if admin tries to create', async () => {
      await expect(service.create(dto, admin as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findById', () => {
    it('should return transaction when found', async () => {
      const tx = makeTx();
      prisma.transaction.findFirst.mockResolvedValue(tx);

      const result = await service.findById('tx-1');

      expect(result).toEqual(tx);
      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        include: { stateHistory: true, dispute: true },
      });
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent')).rejects.toThrow('Transaction not found');
    });
  });

  describe('findAll', () => {
    it('should find transactions where user is buyer or provider', async () => {
      const txs = [makeTx()];
      prisma.transaction.findMany.mockResolvedValue(txs);

      const result = await service.findAll(buyer as any);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ buyerId: 'buyer-1' }, { providerId: 'buyer-1' }],
        },
        include: { stateHistory: true },
      });
      expect(result).toEqual(txs);
    });

    it('should return all transactions for admin', async () => {
      const txs = [makeTx()];
      prisma.transaction.findMany.mockResolvedValue(txs);

      const result = await service.findAll(admin as any);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        include: { stateHistory: true },
      });
      expect(result).toEqual(txs);
    });

    it('should scope provider to their own transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll(provider as any);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ buyerId: 'provider-1' }, { providerId: 'provider-1' }],
        },
        include: { stateHistory: true },
      });
    });
  });

  describe('transition - valid transitions', () => {
    function setupTransition(fromStatus: string, toStatus: string) {
      const tx = makeTx({ status: fromStatus });
      prisma.transaction.findFirst.mockResolvedValue(tx);
      const updatedTx = makeTx({ status: toStatus });
      prisma.$transaction.mockResolvedValue([updatedTx, {}]);
      return { tx, updatedTx };
    }

    it('1. PENDING -> FUNDED (buyer)', async () => {
      const { updatedTx } = setupTransition('PENDING', 'FUNDED');

      const result = await service.fund('tx-1', buyer as any);

      expect(result).toEqual(updatedTx);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('2. PENDING -> EXPIRED (admin)', async () => {
      const { updatedTx } = setupTransition('PENDING', 'EXPIRED');

      const result = await service.transition('tx-1', 'EXPIRED' as any, admin as any);

      expect(result).toEqual(updatedTx);
    });

    it('3. FUNDED -> DELIVERED (provider)', async () => {
      const { updatedTx } = setupTransition('FUNDED', 'DELIVERED');

      const result = await service.deliver('tx-1', provider as any);

      expect(result).toEqual(updatedTx);
    });

    it('4. FUNDED -> DISPUTED (buyer)', async () => {
      const { updatedTx } = setupTransition('FUNDED', 'DISPUTED');

      const result = await service.dispute('tx-1', buyer as any);

      expect(result).toEqual(updatedTx);
    });

    it('5. DELIVERED -> RELEASED (buyer)', async () => {
      const { updatedTx } = setupTransition('DELIVERED', 'RELEASED');

      const result = await service.release('tx-1', buyer as any);

      expect(result).toEqual(updatedTx);
    });

    it('6. DELIVERED -> DISPUTED (buyer)', async () => {
      const { updatedTx } = setupTransition('DELIVERED', 'DISPUTED');

      const result = await service.dispute('tx-1', buyer as any);

      expect(result).toEqual(updatedTx);
    });

    it('7. DISPUTED -> REFUNDED (admin)', async () => {
      const { updatedTx } = setupTransition('DISPUTED', 'REFUNDED');

      const result = await service.refund('tx-1', admin as any);

      expect(result).toEqual(updatedTx);
    });

    it('8. DISPUTED -> RELEASED (admin)', async () => {
      const { updatedTx } = setupTransition('DISPUTED', 'RELEASED');

      const result = await service.transition('tx-1', 'RELEASED' as any, admin as any);

      expect(result).toEqual(updatedTx);
    });

    it('should store reason in state history', async () => {
      setupTransition('FUNDED', 'DISPUTED');

      await service.dispute('tx-1', buyer as any, 'Defective item');

      expect(prisma.transactionStateHistory.create).toHaveBeenCalledWith({
        data: {
          transactionId: 'tx-1',
          fromState: 'FUNDED',
          toState: 'DISPUTED',
          reason: 'Defective item',
        },
      });
    });

    it('should store null reason when not provided', async () => {
      setupTransition('PENDING', 'FUNDED');

      await service.fund('tx-1', buyer as any);

      expect(prisma.transactionStateHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reason: null,
        }),
      });
    });
  });

  describe('transition - invalid transitions', () => {
    it('should reject PENDING -> DELIVERED', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'PENDING' }));

      await expect(
        service.deliver('tx-1', provider as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PENDING -> RELEASED', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'PENDING' }));

      await expect(
        service.release('tx-1', buyer as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FUNDED -> REFUNDED', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'FUNDED' }));

      await expect(
        service.refund('tx-1', admin as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RELEASED -> anything (terminal state)', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'RELEASED' }));

      await expect(
        service.fund('tx-1', buyer as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED -> anything (terminal state)', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'REFUNDED' }));

      await expect(
        service.transition('tx-1', 'PENDING' as any, admin as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject EXPIRED -> anything (terminal state)', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'EXPIRED' }));

      await expect(
        service.fund('tx-1', buyer as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include from and to states in error message', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'PENDING' }));

      await expect(
        service.release('tx-1', buyer as any),
      ).rejects.toThrow('Invalid state transition from PENDING to RELEASED');
    });

    it('should reject PENDING -> DISPUTED', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'PENDING' }));

      await expect(
        service.dispute('tx-1', buyer as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DELIVERED -> FUNDED', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'DELIVERED' }));

      await expect(
        service.fund('tx-1', buyer as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('transition - authorization checks', () => {
    it('FUNDED: only buyer can fund', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'PENDING' }));

      await expect(
        service.fund('tx-1', provider as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.fund('tx-1', provider as any),
      ).rejects.toThrow('Only the buyer can fund a transaction');
    });

    it('DELIVERED: only provider can mark delivered', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'FUNDED' }));

      await expect(
        service.deliver('tx-1', buyer as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.deliver('tx-1', buyer as any),
      ).rejects.toThrow('Only the provider can mark as delivered');
    });

    it('RELEASED from DELIVERED: only buyer can release', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'DELIVERED' }));

      await expect(
        service.release('tx-1', provider as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.release('tx-1', provider as any),
      ).rejects.toThrow('Only the buyer can release funds');
    });

    it('RELEASED from DISPUTED: only admin can release', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'DISPUTED' }));

      await expect(
        service.transition('tx-1', 'RELEASED' as any, buyer as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.transition('tx-1', 'RELEASED' as any, buyer as any),
      ).rejects.toThrow('Only admin can release disputed funds');
    });

    it('DISPUTED: only buyer or provider can dispute', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'FUNDED' }));

      await expect(
        service.dispute('tx-1', admin as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.dispute('tx-1', admin as any),
      ).rejects.toThrow('Only the buyer or provider can dispute');
    });

    it('REFUNDED: only admin can refund', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'DISPUTED' }));

      await expect(
        service.refund('tx-1', buyer as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.refund('tx-1', buyer as any),
      ).rejects.toThrow('Only admin can refund');
    });

    it('EXPIRED: only admin can expire', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'PENDING' }));

      await expect(
        service.transition('tx-1', 'EXPIRED' as any, buyer as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.transition('tx-1', 'EXPIRED' as any, buyer as any),
      ).rejects.toThrow('Only admin can expire transactions');
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.fund('nonexistent', buyer as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('DISPUTED: provider can also dispute', async () => {
      prisma.transaction.findFirst.mockResolvedValue(makeTx({ status: 'FUNDED' }));
      prisma.$transaction.mockResolvedValue([makeTx({ status: 'DISPUTED' }), {}]);

      const result = await service.dispute('tx-1', provider as any);

      expect(result.status).toBe('DISPUTED');
    });
  });
});
