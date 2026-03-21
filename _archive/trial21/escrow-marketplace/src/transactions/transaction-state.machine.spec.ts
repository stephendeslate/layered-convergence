import { describe, it, expect } from 'vitest';
import { isValidTransition, VALID_TRANSITIONS } from './transaction-state.machine';
import { TransactionStatus } from '@prisma/client';

describe('TransactionStateMachine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define transitions for all statuses', () => {
      const allStatuses = Object.values(TransactionStatus);
      for (const status of allStatuses) {
        expect(VALID_TRANSITIONS[status]).toBeDefined();
      }
    });

    it('should allow CREATED → HELD', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.CREATED]).toContain(
        TransactionStatus.HELD,
      );
    });

    it('should allow HELD → RELEASED, DISPUTED, EXPIRED', () => {
      const held = VALID_TRANSITIONS[TransactionStatus.HELD];
      expect(held).toContain(TransactionStatus.RELEASED);
      expect(held).toContain(TransactionStatus.DISPUTED);
      expect(held).toContain(TransactionStatus.EXPIRED);
    });

    it('should allow DISPUTED → RESOLVED_BUYER, RESOLVED_PROVIDER', () => {
      const disputed = VALID_TRANSITIONS[TransactionStatus.DISPUTED];
      expect(disputed).toContain(TransactionStatus.RESOLVED_BUYER);
      expect(disputed).toContain(TransactionStatus.RESOLVED_PROVIDER);
    });

    it('should allow RESOLVED_BUYER → REFUNDED', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.RESOLVED_BUYER]).toContain(
        TransactionStatus.REFUNDED,
      );
    });

    it('should allow RESOLVED_PROVIDER → RELEASED', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.RESOLVED_PROVIDER]).toContain(
        TransactionStatus.RELEASED,
      );
    });

    it('should have no transitions from RELEASED', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.RELEASED]).toHaveLength(0);
    });

    it('should have no transitions from REFUNDED', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.REFUNDED]).toHaveLength(0);
    });

    it('should have no transitions from EXPIRED', () => {
      expect(VALID_TRANSITIONS[TransactionStatus.EXPIRED]).toHaveLength(0);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transition CREATED → HELD', () => {
      expect(isValidTransition(TransactionStatus.CREATED, TransactionStatus.HELD)).toBe(true);
    });

    it('should return true for valid transition HELD → RELEASED', () => {
      expect(isValidTransition(TransactionStatus.HELD, TransactionStatus.RELEASED)).toBe(true);
    });

    it('should return true for valid transition HELD → DISPUTED', () => {
      expect(isValidTransition(TransactionStatus.HELD, TransactionStatus.DISPUTED)).toBe(true);
    });

    it('should return false for invalid transition CREATED → RELEASED', () => {
      expect(isValidTransition(TransactionStatus.CREATED, TransactionStatus.RELEASED)).toBe(false);
    });

    it('should return false for invalid transition RELEASED → HELD', () => {
      expect(isValidTransition(TransactionStatus.RELEASED, TransactionStatus.HELD)).toBe(false);
    });

    it('should return false for invalid transition REFUNDED → CREATED', () => {
      expect(isValidTransition(TransactionStatus.REFUNDED, TransactionStatus.CREATED)).toBe(false);
    });

    it('should return false for invalid transition EXPIRED → HELD', () => {
      expect(isValidTransition(TransactionStatus.EXPIRED, TransactionStatus.HELD)).toBe(false);
    });

    it('should return false for same-state transition', () => {
      expect(isValidTransition(TransactionStatus.HELD, TransactionStatus.HELD)).toBe(false);
    });
  });
});
