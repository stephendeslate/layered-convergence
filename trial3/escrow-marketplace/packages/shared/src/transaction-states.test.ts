import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  getValidTargets,
  isTerminalState,
  TRANSACTION_STATES,
  VALID_TRANSITIONS,
  TERMINAL_STATES,
} from './transaction-states';

describe('Transaction State Machine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define transitions for all non-terminal states', () => {
      const allStates = Object.values(TRANSACTION_STATES);
      const statesWithTransitions = Object.keys(VALID_TRANSITIONS);
      const terminalStates = TERMINAL_STATES;

      for (const state of allStates) {
        if (!terminalStates.includes(state)) {
          expect(statesWithTransitions).toContain(state);
        }
      }
    });

    it('should have no transitions from terminal states', () => {
      for (const state of TERMINAL_STATES) {
        expect(VALID_TRANSITIONS[state]).toBeUndefined();
      }
    });
  });

  describe('isValidTransition', () => {
    it('should allow CREATED → PAYMENT_PENDING', () => {
      expect(isValidTransition('CREATED', 'PAYMENT_PENDING')).toBe(true);
    });

    it('should allow PAYMENT_PENDING → HELD', () => {
      expect(isValidTransition('PAYMENT_PENDING', 'HELD')).toBe(true);
    });

    it('should allow HELD → RELEASED', () => {
      expect(isValidTransition('HELD', 'RELEASED')).toBe(true);
    });

    it('should allow HELD → DISPUTED', () => {
      expect(isValidTransition('HELD', 'DISPUTED')).toBe(true);
    });

    it('should allow HELD → EXPIRED', () => {
      expect(isValidTransition('HELD', 'EXPIRED')).toBe(true);
    });

    it('should allow DISPUTED → RESOLVED_BUYER', () => {
      expect(isValidTransition('DISPUTED', 'RESOLVED_BUYER')).toBe(true);
    });

    it('should allow DISPUTED → RESOLVED_PROVIDER', () => {
      expect(isValidTransition('DISPUTED', 'RESOLVED_PROVIDER')).toBe(true);
    });

    it('should allow RESOLVED_BUYER → REFUND_PENDING', () => {
      expect(isValidTransition('RESOLVED_BUYER', 'REFUND_PENDING')).toBe(true);
    });

    it('should allow RESOLVED_PROVIDER → RELEASED', () => {
      expect(isValidTransition('RESOLVED_PROVIDER', 'RELEASED')).toBe(true);
    });

    // Invalid transitions
    it('should reject CREATED → HELD (must go through PAYMENT_PENDING)', () => {
      expect(isValidTransition('CREATED', 'HELD')).toBe(false);
    });

    it('should reject HELD → PAID (must go through release flow)', () => {
      expect(isValidTransition('HELD', 'PAID')).toBe(false);
    });

    it('should reject PAID → CREATED (terminal state)', () => {
      expect(isValidTransition('PAID', 'CREATED')).toBe(false);
    });

    it('should reject REFUNDED → CREATED (terminal state)', () => {
      expect(isValidTransition('REFUNDED', 'CREATED')).toBe(false);
    });

    it('should reject transitions from unknown states', () => {
      expect(isValidTransition('UNKNOWN', 'CREATED')).toBe(false);
    });
  });

  describe('getValidTargets', () => {
    it('should return valid targets for HELD', () => {
      expect(getValidTargets('HELD')).toEqual(['RELEASED', 'DISPUTED', 'EXPIRED']);
    });

    it('should return empty array for terminal states', () => {
      expect(getValidTargets('PAID')).toEqual([]);
      expect(getValidTargets('REFUNDED')).toEqual([]);
    });

    it('should return empty array for unknown states', () => {
      expect(getValidTargets('UNKNOWN')).toEqual([]);
    });
  });

  describe('isTerminalState', () => {
    it('should identify PAID as terminal', () => {
      expect(isTerminalState('PAID')).toBe(true);
    });

    it('should identify REFUNDED as terminal', () => {
      expect(isTerminalState('REFUNDED')).toBe(true);
    });

    it('should not identify HELD as terminal', () => {
      expect(isTerminalState('HELD')).toBe(false);
    });

    it('should not identify CREATED as terminal', () => {
      expect(isTerminalState('CREATED')).toBe(false);
    });
  });
});
