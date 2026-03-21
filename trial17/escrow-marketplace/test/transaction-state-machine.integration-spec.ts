import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { TransactionService, VALID_TRANSITIONS } from '../src/transaction/transaction.service';
import { TransactionStatus, Role } from '@prisma/client';

/**
 * Integration test: Transaction State Machine
 * Uses REAL PostgreSQL database — NO vi.fn() mocking of PrismaService.
 * Requires docker-compose.test.yml to be running.
 */
describe('Transaction State Machine (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let transactionService: TransactionService;

  let buyerId: string;
  let sellerId: string;
  let adminId: string;

  const buyerPayload = { sub: '', email: 'buyer@test.com', role: 'BUYER' as const };
  const sellerPayload = { sub: '', email: 'seller@test.com', role: 'SELLER' as const };
  const adminPayload = { sub: '', email: 'admin@test.com', role: 'ADMIN' as const };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [TransactionService],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    transactionService = module.get<TransactionService>(TransactionService);

    // Create test users
    const buyer = await prisma.user.create({
      data: {
        email: `buyer-sm-${Date.now()}@test.com`,
        name: 'Test Buyer',
        passwordHash: 'hashed',
        role: Role.BUYER,
      },
    });
    buyerId = buyer.id;
    buyerPayload.sub = buyerId;

    const seller = await prisma.user.create({
      data: {
        email: `seller-sm-${Date.now()}@test.com`,
        name: 'Test Seller',
        passwordHash: 'hashed',
        role: Role.SELLER,
      },
    });
    sellerId = seller.id;
    sellerPayload.sub = sellerId;

    const admin = await prisma.user.create({
      data: {
        email: `admin-sm-${Date.now()}@test.com`,
        name: 'Test Admin',
        passwordHash: 'hashed',
        role: Role.ADMIN,
      },
    });
    adminId = admin.id;
    adminPayload.sub = adminId;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.dispute.deleteMany({});
    await prisma.payout.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({
      where: { id: { in: [buyerId, sellerId, adminId] } },
    });
    await prisma.$disconnect();
  });

  async function createTestTransaction() {
    return transactionService.create(
      { title: 'Test Item', amount: 100.0, sellerId },
      buyerPayload,
    );
  }

  describe('Happy path: PENDING -> FUNDED -> SHIPPED -> DELIVERED -> RELEASED', () => {
    it('should walk the full happy-path lifecycle', async () => {
      const txn = await createTestTransaction();
      expect(txn.status).toBe(TransactionStatus.PENDING);

      const funded = await transactionService.transition(
        txn.id,
        TransactionStatus.FUNDED,
        buyerPayload,
      );
      expect(funded.status).toBe(TransactionStatus.FUNDED);

      const shipped = await transactionService.transition(
        txn.id,
        TransactionStatus.SHIPPED,
        sellerPayload,
      );
      expect(shipped.status).toBe(TransactionStatus.SHIPPED);

      const delivered = await transactionService.transition(
        txn.id,
        TransactionStatus.DELIVERED,
        buyerPayload,
      );
      expect(delivered.status).toBe(TransactionStatus.DELIVERED);

      const released = await transactionService.transition(
        txn.id,
        TransactionStatus.RELEASED,
        buyerPayload,
      );
      expect(released.status).toBe(TransactionStatus.RELEASED);
    });
  });

  describe('CANCELLED -> REFUNDED path', () => {
    it('should allow PENDING -> CANCELLED -> REFUNDED', async () => {
      const txn = await createTestTransaction();

      const cancelled = await transactionService.transition(
        txn.id,
        TransactionStatus.CANCELLED,
        buyerPayload,
      );
      expect(cancelled.status).toBe(TransactionStatus.CANCELLED);

      const refunded = await transactionService.transition(
        txn.id,
        TransactionStatus.REFUNDED,
        adminPayload,
      );
      expect(refunded.status).toBe(TransactionStatus.REFUNDED);
    });

    it('should allow FUNDED -> CANCELLED -> REFUNDED', async () => {
      const txn = await createTestTransaction();

      await transactionService.transition(
        txn.id,
        TransactionStatus.FUNDED,
        buyerPayload,
      );

      const cancelled = await transactionService.transition(
        txn.id,
        TransactionStatus.CANCELLED,
        buyerPayload,
      );
      expect(cancelled.status).toBe(TransactionStatus.CANCELLED);

      const refunded = await transactionService.transition(
        txn.id,
        TransactionStatus.REFUNDED,
        adminPayload,
      );
      expect(refunded.status).toBe(TransactionStatus.REFUNDED);
    });
  });

  describe('Dispute path', () => {
    it('should allow FUNDED -> DISPUTED -> RESOLVED -> RELEASED', async () => {
      const txn = await createTestTransaction();

      await transactionService.transition(
        txn.id,
        TransactionStatus.FUNDED,
        buyerPayload,
      );

      const disputed = await transactionService.transition(
        txn.id,
        TransactionStatus.DISPUTED,
        buyerPayload,
      );
      expect(disputed.status).toBe(TransactionStatus.DISPUTED);

      const resolved = await transactionService.transition(
        txn.id,
        TransactionStatus.RESOLVED,
        adminPayload,
      );
      expect(resolved.status).toBe(TransactionStatus.RESOLVED);

      const released = await transactionService.transition(
        txn.id,
        TransactionStatus.RELEASED,
        adminPayload,
      );
      expect(released.status).toBe(TransactionStatus.RELEASED);
    });

    it('should allow DISPUTED -> RESOLVED -> REFUNDED', async () => {
      const txn = await createTestTransaction();

      await transactionService.transition(
        txn.id,
        TransactionStatus.FUNDED,
        buyerPayload,
      );
      await transactionService.transition(
        txn.id,
        TransactionStatus.DISPUTED,
        buyerPayload,
      );
      await transactionService.transition(
        txn.id,
        TransactionStatus.RESOLVED,
        adminPayload,
      );

      const refunded = await transactionService.transition(
        txn.id,
        TransactionStatus.REFUNDED,
        adminPayload,
      );
      expect(refunded.status).toBe(TransactionStatus.REFUNDED);
    });
  });

  describe('Invalid transitions', () => {
    it('should reject PENDING -> SHIPPED', async () => {
      const txn = await createTestTransaction();

      await expect(
        transactionService.transition(
          txn.id,
          TransactionStatus.SHIPPED,
          sellerPayload,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RELEASED -> any (terminal state)', async () => {
      const txn = await createTestTransaction();

      await transactionService.transition(txn.id, TransactionStatus.FUNDED, buyerPayload);
      await transactionService.transition(txn.id, TransactionStatus.SHIPPED, sellerPayload);
      await transactionService.transition(txn.id, TransactionStatus.DELIVERED, buyerPayload);
      await transactionService.transition(txn.id, TransactionStatus.RELEASED, buyerPayload);

      await expect(
        transactionService.transition(
          txn.id,
          TransactionStatus.FUNDED,
          buyerPayload,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED -> any (terminal state)', async () => {
      const txn = await createTestTransaction();

      await transactionService.transition(txn.id, TransactionStatus.CANCELLED, buyerPayload);
      await transactionService.transition(txn.id, TransactionStatus.REFUNDED, adminPayload);

      await expect(
        transactionService.transition(
          txn.id,
          TransactionStatus.PENDING,
          buyerPayload,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Role-based transition permissions', () => {
    it('should reject seller from funding a transaction', async () => {
      const txn = await createTestTransaction();

      await expect(
        transactionService.transition(
          txn.id,
          TransactionStatus.FUNDED,
          sellerPayload,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject buyer from shipping a transaction', async () => {
      const txn = await createTestTransaction();
      await transactionService.transition(txn.id, TransactionStatus.FUNDED, buyerPayload);

      await expect(
        transactionService.transition(
          txn.id,
          TransactionStatus.SHIPPED,
          buyerPayload,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject non-admin from resolving a dispute', async () => {
      const txn = await createTestTransaction();
      await transactionService.transition(txn.id, TransactionStatus.FUNDED, buyerPayload);
      await transactionService.transition(txn.id, TransactionStatus.DISPUTED, buyerPayload);

      await expect(
        transactionService.transition(
          txn.id,
          TransactionStatus.RESOLVED,
          buyerPayload,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to cancel a transaction', async () => {
      const txn = await createTestTransaction();

      const cancelled = await transactionService.transition(
        txn.id,
        TransactionStatus.CANCELLED,
        adminPayload,
      );
      expect(cancelled.status).toBe(TransactionStatus.CANCELLED);
    });
  });

  describe('State machine completeness', () => {
    it('should define transitions for all 9 states', () => {
      const allStatuses = Object.values(TransactionStatus);
      expect(allStatuses).toHaveLength(9);

      for (const status of allStatuses) {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      }
    });

    it('should have RELEASED and REFUNDED as terminal states', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.RELEASED]).toEqual([]);
      expect(VALID_TRANSITIONS[TransactionStatus.REFUNDED]).toEqual([]);
    });
  });

  describe('Data integrity', () => {
    it('should persist transaction with correct monetary values', async () => {
      const txn = await createTestTransaction();
      const fetched = await transactionService.findOne(txn.id);

      expect(Number(fetched.amount)).toBe(100.0);
      expect(Number(fetched.platformFee)).toBe(2.5); // 2.5% of 100
    });

    it('should include buyer and seller relations', async () => {
      const txn = await createTestTransaction();
      const fetched = await transactionService.findOne(txn.id);

      expect(fetched.buyer).toBeDefined();
      expect(fetched.seller).toBeDefined();
      expect(fetched.buyerId).toBe(buyerId);
      expect(fetched.sellerId).toBe(sellerId);
    });
  });
});
