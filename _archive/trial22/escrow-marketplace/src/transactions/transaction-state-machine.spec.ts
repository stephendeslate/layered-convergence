import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { TransactionStateMachine, VALID_TRANSITIONS } from './transaction-state-machine';

describe('TransactionStateMachine', () => {
  let stateMachine: TransactionStateMachine;

  beforeEach(() => {
    stateMachine = new TransactionStateMachine();
  });

  describe('validateTransition', () => {
    it('should allow CREATED -> HELD', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.CREATED, TransactionStatus.HELD)).not.toThrow();
    });

    it('should allow CREATED -> EXPIRED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.CREATED, TransactionStatus.EXPIRED)).not.toThrow();
    });

    it('should allow HELD -> RELEASED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.HELD, TransactionStatus.RELEASED)).not.toThrow();
    });

    it('should allow HELD -> DISPUTED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.HELD, TransactionStatus.DISPUTED)).not.toThrow();
    });

    it('should allow HELD -> REFUNDED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.HELD, TransactionStatus.REFUNDED)).not.toThrow();
    });

    it('should allow HELD -> EXPIRED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.HELD, TransactionStatus.EXPIRED)).not.toThrow();
    });

    it('should allow DISPUTED -> RELEASED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.DISPUTED, TransactionStatus.RELEASED)).not.toThrow();
    });

    it('should allow DISPUTED -> REFUNDED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.DISPUTED, TransactionStatus.REFUNDED)).not.toThrow();
    });

    it('should throw BadRequestException for CREATED -> RELEASED', () => {
      expect(() => stateMachine.validateTransition(TransactionStatus.CREATED, TransactionStatus.RELEASED))
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException for RELEASED -> any', () => {
      for (const status of Object.values(TransactionStatus)) {
        expect(() => stateMachine.validateTransition(TransactionStatus.RELEASED, status))
          .toThrow(BadRequestException);
      }
    });

    it('should throw BadRequestException for REFUNDED -> any', () => {
      for (const status of Object.values(TransactionStatus)) {
        expect(() => stateMachine.validateTransition(TransactionStatus.REFUNDED, status))
          .toThrow(BadRequestException);
      }
    });

    it('should throw BadRequestException for EXPIRED -> any', () => {
      for (const status of Object.values(TransactionStatus)) {
        expect(() => stateMachine.validateTransition(TransactionStatus.EXPIRED, status))
          .toThrow(BadRequestException);
      }
    });

    it('should include state names in error message', () => {
      try {
        stateMachine.validateTransition(TransactionStatus.CREATED, TransactionStatus.RELEASED);
      } catch (e: any) {
        expect(e.message).toContain('CREATED');
        expect(e.message).toContain('RELEASED');
      }
    });
  });

  describe('canTransition', () => {
    it('should return true for valid transitions', () => {
      expect(stateMachine.canTransition(TransactionStatus.CREATED, TransactionStatus.HELD)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(stateMachine.canTransition(TransactionStatus.CREATED, TransactionStatus.RELEASED)).toBe(false);
    });

    it('should return false for terminal states', () => {
      expect(stateMachine.canTransition(TransactionStatus.RELEASED, TransactionStatus.HELD)).toBe(false);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions from CREATED', () => {
      const transitions = stateMachine.getValidTransitions(TransactionStatus.CREATED);
      expect(transitions).toContain(TransactionStatus.HELD);
      expect(transitions).toContain(TransactionStatus.EXPIRED);
      expect(transitions).toHaveLength(2);
    });

    it('should return valid transitions from HELD', () => {
      const transitions = stateMachine.getValidTransitions(TransactionStatus.HELD);
      expect(transitions).toHaveLength(4);
    });

    it('should return empty array for terminal states', () => {
      expect(stateMachine.getValidTransitions(TransactionStatus.RELEASED)).toEqual([]);
      expect(stateMachine.getValidTransitions(TransactionStatus.REFUNDED)).toEqual([]);
      expect(stateMachine.getValidTransitions(TransactionStatus.EXPIRED)).toEqual([]);
    });
  });

  describe('VALID_TRANSITIONS map', () => {
    it('should have entries for all statuses', () => {
      for (const status of Object.values(TransactionStatus)) {
        expect(VALID_TRANSITIONS.has(status)).toBe(true);
      }
    });
  });
});
