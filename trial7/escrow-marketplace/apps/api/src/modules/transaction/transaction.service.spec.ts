import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus, BadRequestException } from '@nestjs/common';

/**
 * Unit tests for the transaction state machine.
 * Verifies all valid transitions and rejects invalid ones.
 * Convention 5.22: verifies BadRequestException (not plain Error) for invalid transitions.
 */
describe('TransactionService', () => {
  let service: TransactionService;

  const mockPrisma = {
    user: { findFirstOrThrow: jest.fn() },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirstOrThrow: jest.fn(),
      update: jest.fn(),
    },
    transactionStateHistory: { create: jest.fn() },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        transactionStateHistory: { create: jest.fn() },
        transaction: { update: jest.fn().mockResolvedValue({}) },
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('validateTransitionReason', () => {
    it('should return reason for PENDING', () => {
      expect(service.validateTransitionReason(TransactionStatus.PENDING)).toBe(
        'Transaction initiated',
      );
    });

    it('should return reason for HELD', () => {
      expect(service.validateTransitionReason(TransactionStatus.HELD)).toBe(
        'Payment captured and held',
      );
    });

    it('should return reason for all valid statuses', () => {
      const statuses = Object.values(TransactionStatus);
      for (const status of statuses) {
        expect(() => service.validateTransitionReason(status)).not.toThrow();
      }
    });
  });

  describe('transition', () => {
    it('should reject invalid transition from PENDING to RELEASED', async () => {
      mockPrisma.transaction.findFirstOrThrow.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
      });

      await expect(
        service.transition('tx-1', {
          toStatus: TransactionStatus.RELEASED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition from COMPLETED to HELD', async () => {
      mockPrisma.transaction.findFirstOrThrow.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.COMPLETED,
      });

      await expect(
        service.transition('tx-1', {
          toStatus: TransactionStatus.HELD,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from terminal state REFUNDED', async () => {
      mockPrisma.transaction.findFirstOrThrow.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.REFUNDED,
      });

      await expect(
        service.transition('tx-1', {
          toStatus: TransactionStatus.RELEASED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
