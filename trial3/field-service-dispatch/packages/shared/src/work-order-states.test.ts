import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  getValidTargets,
  isTerminalState,
  WORK_ORDER_STATUSES,
  VALID_TRANSITIONS,
} from './work-order-states';

describe('Work Order State Machine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define transitions for all non-terminal states', () => {
      const nonTerminal = Object.values(WORK_ORDER_STATUSES).filter(
        (s) => !isTerminalState(s),
      );
      for (const state of nonTerminal) {
        expect(VALID_TRANSITIONS[state]).toBeDefined();
        expect(VALID_TRANSITIONS[state].length).toBeGreaterThan(0);
      }
    });
  });

  describe('isValidTransition', () => {
    // Forward flow
    it('should allow UNASSIGNED → ASSIGNED', () => {
      expect(isValidTransition('UNASSIGNED', 'ASSIGNED')).toBe(true);
    });

    it('should allow ASSIGNED → EN_ROUTE', () => {
      expect(isValidTransition('ASSIGNED', 'EN_ROUTE')).toBe(true);
    });

    it('should allow EN_ROUTE → ON_SITE', () => {
      expect(isValidTransition('EN_ROUTE', 'ON_SITE')).toBe(true);
    });

    it('should allow ON_SITE → IN_PROGRESS', () => {
      expect(isValidTransition('ON_SITE', 'IN_PROGRESS')).toBe(true);
    });

    it('should allow IN_PROGRESS → COMPLETED', () => {
      expect(isValidTransition('IN_PROGRESS', 'COMPLETED')).toBe(true);
    });

    it('should allow COMPLETED → INVOICED', () => {
      expect(isValidTransition('COMPLETED', 'INVOICED')).toBe(true);
    });

    it('should allow INVOICED → PAID', () => {
      expect(isValidTransition('INVOICED', 'PAID')).toBe(true);
    });

    // Reverse transitions
    it('should allow ASSIGNED → UNASSIGNED (unassign)', () => {
      expect(isValidTransition('ASSIGNED', 'UNASSIGNED')).toBe(true);
    });

    it('should allow EN_ROUTE → ASSIGNED (abort travel)', () => {
      expect(isValidTransition('EN_ROUTE', 'ASSIGNED')).toBe(true);
    });

    // Invalid transitions
    it('should reject UNASSIGNED → EN_ROUTE (must be assigned first)', () => {
      expect(isValidTransition('UNASSIGNED', 'EN_ROUTE')).toBe(false);
    });

    it('should reject COMPLETED → ASSIGNED (cannot reopen)', () => {
      expect(isValidTransition('COMPLETED', 'ASSIGNED')).toBe(false);
    });

    it('should reject PAID → anything (terminal state)', () => {
      expect(isValidTransition('PAID', 'UNASSIGNED')).toBe(false);
      expect(isValidTransition('PAID', 'COMPLETED')).toBe(false);
    });

    it('should reject unknown states', () => {
      expect(isValidTransition('UNKNOWN', 'ASSIGNED')).toBe(false);
    });
  });

  describe('getValidTargets', () => {
    it('should return valid targets for ASSIGNED', () => {
      expect(getValidTargets('ASSIGNED')).toEqual(['EN_ROUTE', 'UNASSIGNED']);
    });

    it('should return empty array for PAID (terminal)', () => {
      expect(getValidTargets('PAID')).toEqual([]);
    });
  });

  describe('isTerminalState', () => {
    it('should identify PAID as terminal', () => {
      expect(isTerminalState('PAID')).toBe(true);
    });

    it('should not identify IN_PROGRESS as terminal', () => {
      expect(isTerminalState('IN_PROGRESS')).toBe(false);
    });
  });

  describe('full lifecycle', () => {
    it('should support complete happy path', () => {
      const happyPath = [
        'UNASSIGNED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE',
        'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID',
      ];

      for (let i = 0; i < happyPath.length - 1; i++) {
        expect(isValidTransition(happyPath[i], happyPath[i + 1])).toBe(true);
      }
    });
  });
});
