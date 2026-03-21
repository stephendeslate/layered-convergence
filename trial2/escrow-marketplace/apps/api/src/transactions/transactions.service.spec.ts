import { describe, it, expect } from 'vitest';
import {
  TransactionStatus,
  canTransition,
  isTerminalState,
  getValidTransitions,
  getValidTargetStates,
  VALID_TRANSITIONS,
  TERMINAL_STATES,
} from '@repo/shared';

describe('Transaction State Machine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define CREATED -> HELD via PAYMENT_SUCCEEDED', () => {
      expect(canTransition(TransactionStatus.CREATED, TransactionStatus.HELD, 'PAYMENT_SUCCEEDED')).toBe(true);
    });

    it('should define CREATED -> EXPIRED via PAYMENT_EXPIRED', () => {
      expect(canTransition(TransactionStatus.CREATED, TransactionStatus.EXPIRED, 'PAYMENT_EXPIRED')).toBe(true);
    });

    it('should define CREATED -> EXPIRED via BUYER_CANCELLED', () => {
      expect(canTransition(TransactionStatus.CREATED, TransactionStatus.EXPIRED, 'BUYER_CANCELLED')).toBe(true);
    });

    it('should define HELD -> RELEASED via BUYER_CONFIRMED', () => {
      expect(canTransition(TransactionStatus.HELD, TransactionStatus.RELEASED, 'BUYER_CONFIRMED')).toBe(true);
    });

    it('should define HELD -> RELEASED via AUTO_RELEASED', () => {
      expect(canTransition(TransactionStatus.HELD, TransactionStatus.RELEASED, 'AUTO_RELEASED')).toBe(true);
    });

    it('should define HELD -> RELEASED via ADMIN_RELEASED', () => {
      expect(canTransition(TransactionStatus.HELD, TransactionStatus.RELEASED, 'ADMIN_RELEASED')).toBe(true);
    });

    it('should define HELD -> DISPUTED via BUYER_DISPUTED', () => {
      expect(canTransition(TransactionStatus.HELD, TransactionStatus.DISPUTED, 'BUYER_DISPUTED')).toBe(true);
    });

    it('should define HELD -> REFUNDED via ADMIN_REFUNDED', () => {
      expect(canTransition(TransactionStatus.HELD, TransactionStatus.REFUNDED, 'ADMIN_REFUNDED')).toBe(true);
    });

    it('should define DISPUTED -> RELEASED via DISPUTE_RESOLVED_PROVIDER', () => {
      expect(canTransition(TransactionStatus.DISPUTED, TransactionStatus.RELEASED, 'DISPUTE_RESOLVED_PROVIDER')).toBe(true);
    });

    it('should define DISPUTED -> REFUNDED via DISPUTE_RESOLVED_BUYER', () => {
      expect(canTransition(TransactionStatus.DISPUTED, TransactionStatus.REFUNDED, 'DISPUTE_RESOLVED_BUYER')).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('should reject CREATED -> RELEASED directly', () => {
      expect(canTransition(TransactionStatus.CREATED, TransactionStatus.RELEASED, 'BUYER_CONFIRMED')).toBe(false);
    });

    it('should reject RELEASED -> anything (terminal state)', () => {
      expect(getValidTransitions(TransactionStatus.RELEASED)).toHaveLength(0);
    });

    it('should reject REFUNDED -> anything (terminal state)', () => {
      expect(getValidTransitions(TransactionStatus.REFUNDED)).toHaveLength(0);
    });

    it('should reject EXPIRED -> anything (terminal state)', () => {
      expect(getValidTransitions(TransactionStatus.EXPIRED)).toHaveLength(0);
    });
  });

  describe('terminal states', () => {
    it('should identify RELEASED as terminal', () => {
      expect(isTerminalState(TransactionStatus.RELEASED)).toBe(true);
    });

    it('should identify REFUNDED as terminal', () => {
      expect(isTerminalState(TransactionStatus.REFUNDED)).toBe(true);
    });

    it('should identify EXPIRED as terminal', () => {
      expect(isTerminalState(TransactionStatus.EXPIRED)).toBe(true);
    });

    it('should not identify CREATED as terminal', () => {
      expect(isTerminalState(TransactionStatus.CREATED)).toBe(false);
    });

    it('should not identify HELD as terminal', () => {
      expect(isTerminalState(TransactionStatus.HELD)).toBe(false);
    });

    it('should not identify DISPUTED as terminal', () => {
      expect(isTerminalState(TransactionStatus.DISPUTED)).toBe(false);
    });

    it('should have exactly 3 terminal states', () => {
      expect(TERMINAL_STATES).toHaveLength(3);
    });
  });

  describe('getValidTargetStates', () => {
    it('should return HELD and EXPIRED from CREATED', () => {
      const targets = getValidTargetStates(TransactionStatus.CREATED);
      expect(targets).toContain(TransactionStatus.HELD);
      expect(targets).toContain(TransactionStatus.EXPIRED);
      expect(targets).toHaveLength(2);
    });

    it('should return RELEASED, DISPUTED, and REFUNDED from HELD', () => {
      const targets = getValidTargetStates(TransactionStatus.HELD);
      expect(targets).toContain(TransactionStatus.RELEASED);
      expect(targets).toContain(TransactionStatus.DISPUTED);
      expect(targets).toContain(TransactionStatus.REFUNDED);
      expect(targets).toHaveLength(3);
    });

    it('should return RELEASED and REFUNDED from DISPUTED', () => {
      const targets = getValidTargetStates(TransactionStatus.DISPUTED);
      expect(targets).toContain(TransactionStatus.RELEASED);
      expect(targets).toContain(TransactionStatus.REFUNDED);
      expect(targets).toHaveLength(2);
    });
  });

  describe('full transition coverage', () => {
    it('should have 10 valid transitions total', () => {
      expect(VALID_TRANSITIONS).toHaveLength(10);
    });
  });
});
