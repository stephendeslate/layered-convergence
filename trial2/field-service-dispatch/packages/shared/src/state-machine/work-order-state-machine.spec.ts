import { describe, it, expect } from 'vitest';
import {
  isValidTransition,
  getTransition,
  getValidNextStatuses,
  canUserTransition,
  VALID_TRANSITIONS,
} from './work-order-state-machine';
import { WorkOrderStatus, UserRole } from '../enums';

describe('WorkOrderStateMachine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define the complete forward flow', () => {
      const forwardFlow = [
        [WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED],
        [WorkOrderStatus.ASSIGNED, WorkOrderStatus.EN_ROUTE],
        [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ON_SITE],
        [WorkOrderStatus.ON_SITE, WorkOrderStatus.IN_PROGRESS],
        [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED],
        [WorkOrderStatus.COMPLETED, WorkOrderStatus.INVOICED],
        [WorkOrderStatus.INVOICED, WorkOrderStatus.PAID],
      ];

      for (const [from, to] of forwardFlow) {
        expect(isValidTransition(from, to)).toBe(true);
      }
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(isValidTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.COMPLETED)).toBe(false);
      expect(isValidTransition(WorkOrderStatus.PAID, WorkOrderStatus.UNASSIGNED)).toBe(false);
    });
  });

  describe('getTransition', () => {
    it('should return transition details', () => {
      const t = getTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED);
      expect(t).toBeDefined();
      expect(t?.requiredRoles).toContain(UserRole.ADMIN);
      expect(t?.requiredRoles).toContain(UserRole.DISPATCHER);
    });

    it('should return undefined for invalid transitions', () => {
      expect(getTransition(WorkOrderStatus.PAID, WorkOrderStatus.UNASSIGNED)).toBeUndefined();
    });
  });

  describe('getValidNextStatuses', () => {
    it('should return correct next statuses for ASSIGNED', () => {
      const next = getValidNextStatuses(WorkOrderStatus.ASSIGNED);
      expect(next).toContain(WorkOrderStatus.EN_ROUTE);
      expect(next).toContain(WorkOrderStatus.UNASSIGNED);
    });

    it('should return empty for PAID', () => {
      const next = getValidNextStatuses(WorkOrderStatus.PAID);
      expect(next).toHaveLength(0);
    });
  });

  describe('canUserTransition', () => {
    it('should allow ADMIN to assign', () => {
      expect(
        canUserTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED, UserRole.ADMIN),
      ).toBe(true);
    });

    it('should allow TECHNICIAN to start en_route', () => {
      expect(
        canUserTransition(WorkOrderStatus.ASSIGNED, WorkOrderStatus.EN_ROUTE, UserRole.TECHNICIAN),
      ).toBe(true);
    });

    it('should deny CUSTOMER from assigning', () => {
      expect(
        canUserTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED, UserRole.CUSTOMER),
      ).toBe(false);
    });

    it('should deny TECHNICIAN from invoicing', () => {
      expect(
        canUserTransition(WorkOrderStatus.COMPLETED, WorkOrderStatus.INVOICED, UserRole.TECHNICIAN),
      ).toBe(false);
    });
  });
});
