import { BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { validateTransition, VALID_TRANSITIONS } from './transaction-state-machine';

describe('TransactionStateMachine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define transitions for all statuses', () => {
      const allStatuses = Object.values(TransactionStatus);
      for (const status of allStatuses) {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      }
    });

    it('should have RELEASED and REFUNDED as terminal states', () => {
      expect(VALID_TRANSITIONS.RELEASED).toEqual([]);
      expect(VALID_TRANSITIONS.REFUNDED).toEqual([]);
    });

    it('should have CANCELLED as terminal state', () => {
      expect(VALID_TRANSITIONS.CANCELLED).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    it('should allow PENDING -> PAYMENT_HELD', () => {
      expect(() =>
        validateTransition(TransactionStatus.PENDING, TransactionStatus.PAYMENT_HELD),
      ).not.toThrow();
    });

    it('should allow PENDING -> CANCELLED', () => {
      expect(() =>
        validateTransition(TransactionStatus.PENDING, TransactionStatus.CANCELLED),
      ).not.toThrow();
    });

    it('should allow PAYMENT_HELD -> DELIVERED', () => {
      expect(() =>
        validateTransition(TransactionStatus.PAYMENT_HELD, TransactionStatus.DELIVERED),
      ).not.toThrow();
    });

    it('should allow PAYMENT_HELD -> DISPUTED', () => {
      expect(() =>
        validateTransition(TransactionStatus.PAYMENT_HELD, TransactionStatus.DISPUTED),
      ).not.toThrow();
    });

    it('should allow PAYMENT_HELD -> EXPIRED', () => {
      expect(() =>
        validateTransition(TransactionStatus.PAYMENT_HELD, TransactionStatus.EXPIRED),
      ).not.toThrow();
    });

    it('should allow DELIVERED -> RELEASED', () => {
      expect(() =>
        validateTransition(TransactionStatus.DELIVERED, TransactionStatus.RELEASED),
      ).not.toThrow();
    });

    it('should allow DELIVERED -> DISPUTED', () => {
      expect(() =>
        validateTransition(TransactionStatus.DELIVERED, TransactionStatus.DISPUTED),
      ).not.toThrow();
    });

    it('should allow DISPUTED -> REFUNDED', () => {
      expect(() =>
        validateTransition(TransactionStatus.DISPUTED, TransactionStatus.REFUNDED),
      ).not.toThrow();
    });

    it('should allow DISPUTED -> RELEASED', () => {
      expect(() =>
        validateTransition(TransactionStatus.DISPUTED, TransactionStatus.RELEASED),
      ).not.toThrow();
    });

    it('should allow EXPIRED -> REFUNDED', () => {
      expect(() =>
        validateTransition(TransactionStatus.EXPIRED, TransactionStatus.REFUNDED),
      ).not.toThrow();
    });

    it('should reject PENDING -> RELEASED', () => {
      expect(() =>
        validateTransition(TransactionStatus.PENDING, TransactionStatus.RELEASED),
      ).toThrow(BadRequestException);
    });

    it('should reject RELEASED -> PENDING', () => {
      expect(() =>
        validateTransition(TransactionStatus.RELEASED, TransactionStatus.PENDING),
      ).toThrow(BadRequestException);
    });

    it('should reject REFUNDED -> any', () => {
      for (const status of Object.values(TransactionStatus)) {
        if (status === TransactionStatus.REFUNDED) continue;
        expect(() =>
          validateTransition(TransactionStatus.REFUNDED, status),
        ).toThrow(BadRequestException);
      }
    });

    it('should reject CANCELLED -> any', () => {
      for (const status of Object.values(TransactionStatus)) {
        if (status === TransactionStatus.CANCELLED) continue;
        expect(() =>
          validateTransition(TransactionStatus.CANCELLED, status),
        ).toThrow(BadRequestException);
      }
    });

    it('should include from and to in error message', () => {
      try {
        validateTransition(TransactionStatus.RELEASED, TransactionStatus.PENDING);
        expect.unreachable('Should have thrown');
      } catch (e: any) {
        expect(e.message).toContain('RELEASED');
        expect(e.message).toContain('PENDING');
      }
    });
  });
});
