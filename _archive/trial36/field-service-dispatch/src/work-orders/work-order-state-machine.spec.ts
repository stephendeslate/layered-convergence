import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { VALID_TRANSITIONS, validateTransition } from './work-order-state-machine';

describe('WorkOrderStateMachine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should allow UNASSIGNED -> ASSIGNED', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.UNASSIGNED]).toContain(WorkOrderStatus.ASSIGNED);
    });

    it('should allow ASSIGNED -> EN_ROUTE', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.ASSIGNED]).toContain(WorkOrderStatus.EN_ROUTE);
    });

    it('should allow ASSIGNED -> UNASSIGNED (backward)', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.ASSIGNED]).toContain(WorkOrderStatus.UNASSIGNED);
    });

    it('should allow EN_ROUTE -> ON_SITE', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.EN_ROUTE]).toContain(WorkOrderStatus.ON_SITE);
    });

    it('should allow EN_ROUTE -> ASSIGNED (backward)', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.EN_ROUTE]).toContain(WorkOrderStatus.ASSIGNED);
    });

    it('should allow ON_SITE -> IN_PROGRESS', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.ON_SITE]).toContain(WorkOrderStatus.IN_PROGRESS);
    });

    it('should allow IN_PROGRESS -> COMPLETED', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.IN_PROGRESS]).toContain(WorkOrderStatus.COMPLETED);
    });

    it('should allow COMPLETED -> INVOICED', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.COMPLETED]).toContain(WorkOrderStatus.INVOICED);
    });

    it('should allow INVOICED -> PAID', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.INVOICED]).toContain(WorkOrderStatus.PAID);
    });

    it('should not allow PAID to transition anywhere', () => {
      expect(VALID_TRANSITIONS[WorkOrderStatus.PAID]).toHaveLength(0);
    });

    it('should define transitions for all statuses', () => {
      const statuses = Object.values(WorkOrderStatus);
      for (const status of statuses) {
        expect(VALID_TRANSITIONS[status]).toBeDefined();
      }
    });
  });

  describe('validateTransition', () => {
    it('should not throw for valid transition', () => {
      expect(() => validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED)).not.toThrow();
    });

    it('should throw BadRequestException for invalid transition', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.COMPLETED),
      ).toThrow(BadRequestException);
    });

    it('should throw for PAID -> any transition', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.PAID, WorkOrderStatus.UNASSIGNED),
      ).toThrow(BadRequestException);
    });

    it('should include current and target status in error message', () => {
      try {
        validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.COMPLETED);
      } catch (e: any) {
        expect(e.message).toContain('UNASSIGNED');
        expect(e.message).toContain('COMPLETED');
      }
    });

    it('should allow backward transitions where defined', () => {
      expect(() =>
        validateTransition(WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ASSIGNED),
      ).not.toThrow();
    });
  });
});
