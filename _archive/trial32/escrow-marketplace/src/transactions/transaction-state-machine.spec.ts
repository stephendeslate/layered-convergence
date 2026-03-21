import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { TransactionStateMachine, VALID_TRANSITIONS } from './transaction-state-machine';

const TransactionStatus = {
  CREATED: 'CREATED' as const,
  HELD: 'HELD' as const,
  RELEASED: 'RELEASED' as const,
  DISPUTED: 'DISPUTED' as const,
  REFUNDED: 'REFUNDED' as const,
  EXPIRED: 'EXPIRED' as const,
};

describe('TransactionStateMachine', () => {
  let stateMachine: TransactionStateMachine;

  beforeEach(() => {
    stateMachine = new TransactionStateMachine();
  });

  describe('validateTransition', () => {
    it('should allow CREATED -> HELD', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.CREATED as any, TransactionStatus.HELD as any),
      ).not.toThrow();
    });

    it('should allow CREATED -> EXPIRED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.CREATED as any, TransactionStatus.EXPIRED as any),
      ).not.toThrow();
    });

    it('should allow HELD -> RELEASED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.HELD as any, TransactionStatus.RELEASED as any),
      ).not.toThrow();
    });

    it('should allow HELD -> DISPUTED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.HELD as any, TransactionStatus.DISPUTED as any),
      ).not.toThrow();
    });

    it('should allow HELD -> REFUNDED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.HELD as any, TransactionStatus.REFUNDED as any),
      ).not.toThrow();
    });

    it('should allow HELD -> EXPIRED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.HELD as any, TransactionStatus.EXPIRED as any),
      ).not.toThrow();
    });

    it('should allow DISPUTED -> RELEASED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.DISPUTED as any, TransactionStatus.RELEASED as any),
      ).not.toThrow();
    });

    it('should allow DISPUTED -> REFUNDED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.DISPUTED as any, TransactionStatus.REFUNDED as any),
      ).not.toThrow();
    });

    it('should throw BadRequestException for CREATED -> RELEASED', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.CREATED as any, TransactionStatus.RELEASED as any),
      ).toThrow(BadRequestException);
    });

    it('should throw for RELEASED -> any (terminal state)', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.RELEASED as any, TransactionStatus.HELD as any),
      ).toThrow(BadRequestException);
    });

    it('should throw for REFUNDED -> any (terminal state)', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.REFUNDED as any, TransactionStatus.CREATED as any),
      ).toThrow(BadRequestException);
    });

    it('should throw for EXPIRED -> any (terminal state)', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.EXPIRED as any, TransactionStatus.HELD as any),
      ).toThrow(BadRequestException);
    });

    it('should throw for CREATED -> DISPUTED (skipping HELD)', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.CREATED as any, TransactionStatus.DISPUTED as any),
      ).toThrow(BadRequestException);
    });

    it('should throw for CREATED -> REFUNDED (skipping HELD)', () => {
      expect(() =>
        stateMachine.validateTransition(TransactionStatus.CREATED as any, TransactionStatus.REFUNDED as any),
      ).toThrow(BadRequestException);
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transitions', () => {
      expect(stateMachine.canTransition(TransactionStatus.CREATED as any, TransactionStatus.HELD as any)).toBe(true);
    });

    it('should return true for HELD -> RELEASED', () => {
      expect(stateMachine.canTransition(TransactionStatus.HELD as any, TransactionStatus.RELEASED as any)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(stateMachine.canTransition(TransactionStatus.CREATED as any, TransactionStatus.RELEASED as any)).toBe(false);
    });

    it('should return false for terminal states', () => {
      expect(stateMachine.canTransition(TransactionStatus.RELEASED as any, TransactionStatus.HELD as any)).toBe(false);
    });

    it('should return false for EXPIRED -> HELD', () => {
      expect(stateMachine.canTransition(TransactionStatus.EXPIRED as any, TransactionStatus.HELD as any)).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for CREATED', () => {
      const transitions = stateMachine.getValidTransitions(TransactionStatus.CREATED as any);
      expect(transitions).toContain(TransactionStatus.HELD);
      expect(transitions).toContain(TransactionStatus.EXPIRED);
      expect(transitions).toHaveLength(2);
    });

    it('should return valid transitions for HELD', () => {
      const transitions = stateMachine.getValidTransitions(TransactionStatus.HELD as any);
      expect(transitions).toHaveLength(4);
    });

    it('should return valid transitions for DISPUTED', () => {
      const transitions = stateMachine.getValidTransitions(TransactionStatus.DISPUTED as any);
      expect(transitions).toHaveLength(2);
      expect(transitions).toContain(TransactionStatus.RELEASED);
      expect(transitions).toContain(TransactionStatus.REFUNDED);
    });

    it('should return empty array for RELEASED', () => {
      expect(stateMachine.getValidTransitions(TransactionStatus.RELEASED as any)).toEqual([]);
    });

    it('should return empty array for REFUNDED', () => {
      expect(stateMachine.getValidTransitions(TransactionStatus.REFUNDED as any)).toEqual([]);
    });

    it('should return empty array for EXPIRED', () => {
      expect(stateMachine.getValidTransitions(TransactionStatus.EXPIRED as any)).toEqual([]);
    });
  });

  describe('VALID_TRANSITIONS map', () => {
    it('should have entries for all states', () => {
      expect(VALID_TRANSITIONS.size).toBe(6);
    });

    it('should have the correct number of transitions from HELD', () => {
      expect(VALID_TRANSITIONS.get(TransactionStatus.HELD as any)).toHaveLength(4);
    });
  });
});
