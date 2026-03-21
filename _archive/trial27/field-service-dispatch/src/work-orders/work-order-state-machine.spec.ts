import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { VALID_TRANSITIONS, validateTransition } from './work-order-state-machine';

describe('WorkOrderStateMachine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define all 8 statuses', () => {
      const statuses = Object.keys(VALID_TRANSITIONS);
      expect(statuses).toHaveLength(8);
    });

    it('should allow UNASSIGNED -> ASSIGNED', () => {
      expect(VALID_TRANSITIONS.UNASSIGNED).toContain('ASSIGNED');
    });

    it('should allow ASSIGNED -> EN_ROUTE', () => {
      expect(VALID_TRANSITIONS.ASSIGNED).toContain('EN_ROUTE');
    });

    it('should allow ASSIGNED -> UNASSIGNED (backward)', () => {
      expect(VALID_TRANSITIONS.ASSIGNED).toContain('UNASSIGNED');
    });

    it('should allow EN_ROUTE -> ON_SITE', () => {
      expect(VALID_TRANSITIONS.EN_ROUTE).toContain('ON_SITE');
    });

    it('should allow ON_SITE -> IN_PROGRESS', () => {
      expect(VALID_TRANSITIONS.ON_SITE).toContain('IN_PROGRESS');
    });

    it('should allow IN_PROGRESS -> COMPLETED', () => {
      expect(VALID_TRANSITIONS.IN_PROGRESS).toContain('COMPLETED');
    });

    it('should allow COMPLETED -> INVOICED', () => {
      expect(VALID_TRANSITIONS.COMPLETED).toContain('INVOICED');
    });

    it('should allow INVOICED -> PAID', () => {
      expect(VALID_TRANSITIONS.INVOICED).toContain('PAID');
    });

    it('should not allow PAID -> anything (terminal)', () => {
      expect(VALID_TRANSITIONS.PAID).toHaveLength(0);
    });

    it('should not allow UNASSIGNED -> COMPLETED', () => {
      expect(VALID_TRANSITIONS.UNASSIGNED).not.toContain('COMPLETED');
    });

    it('should not allow COMPLETED -> ASSIGNED', () => {
      expect(VALID_TRANSITIONS.COMPLETED).not.toContain('ASSIGNED');
    });
  });

  describe('validateTransition', () => {
    it('should not throw for valid transition', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED),
      ).not.toThrow();
    });

    it('should throw BadRequestException for invalid transition', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.COMPLETED),
      ).toThrow(BadRequestException);
    });

    it('should include from/to in error message', () => {
      try {
        validateTransition(WorkOrderStatus.PAID, WorkOrderStatus.ASSIGNED);
      } catch (e: any) {
        expect(e.message).toContain('PAID');
        expect(e.message).toContain('ASSIGNED');
      }
    });

    it('should throw for PAID -> COMPLETED', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.PAID, WorkOrderStatus.COMPLETED),
      ).toThrow(BadRequestException);
    });

    it('should allow backward transition EN_ROUTE -> ASSIGNED', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ASSIGNED),
      ).not.toThrow();
    });
  });
});
