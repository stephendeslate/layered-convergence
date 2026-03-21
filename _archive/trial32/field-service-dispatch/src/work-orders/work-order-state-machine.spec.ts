import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  VALID_TRANSITIONS,
  validateTransition,
} from './work-order-state-machine';
import { WorkOrderStatus } from '@prisma/client';

describe('WorkOrderStateMachine', () => {
  describe('VALID_TRANSITIONS', () => {
    it('should define transitions for all WorkOrderStatus values', () => {
      const statuses: WorkOrderStatus[] = [
        'UNASSIGNED',
        'ASSIGNED',
        'EN_ROUTE',
        'ON_SITE',
        'IN_PROGRESS',
        'COMPLETED',
        'INVOICED',
        'PAID',
      ];
      for (const status of statuses) {
        expect(VALID_TRANSITIONS[status]).toBeDefined();
      }
    });

    it('should allow UNASSIGNED -> ASSIGNED', () => {
      expect(VALID_TRANSITIONS['UNASSIGNED']).toContain('ASSIGNED');
    });

    it('should allow ASSIGNED -> EN_ROUTE', () => {
      expect(VALID_TRANSITIONS['ASSIGNED']).toContain('EN_ROUTE');
    });

    it('should allow ASSIGNED -> UNASSIGNED (backward)', () => {
      expect(VALID_TRANSITIONS['ASSIGNED']).toContain('UNASSIGNED');
    });

    it('should allow EN_ROUTE -> ON_SITE', () => {
      expect(VALID_TRANSITIONS['EN_ROUTE']).toContain('ON_SITE');
    });

    it('should allow EN_ROUTE -> ASSIGNED (backward)', () => {
      expect(VALID_TRANSITIONS['EN_ROUTE']).toContain('ASSIGNED');
    });

    it('should allow ON_SITE -> IN_PROGRESS', () => {
      expect(VALID_TRANSITIONS['ON_SITE']).toContain('IN_PROGRESS');
    });

    it('should allow ON_SITE -> EN_ROUTE (backward)', () => {
      expect(VALID_TRANSITIONS['ON_SITE']).toContain('EN_ROUTE');
    });

    it('should allow IN_PROGRESS -> COMPLETED', () => {
      expect(VALID_TRANSITIONS['IN_PROGRESS']).toContain('COMPLETED');
    });

    it('should allow IN_PROGRESS -> ON_SITE (backward)', () => {
      expect(VALID_TRANSITIONS['IN_PROGRESS']).toContain('ON_SITE');
    });

    it('should allow COMPLETED -> INVOICED', () => {
      expect(VALID_TRANSITIONS['COMPLETED']).toContain('INVOICED');
    });

    it('should allow INVOICED -> PAID', () => {
      expect(VALID_TRANSITIONS['INVOICED']).toContain('PAID');
    });

    it('should not allow transitions from PAID', () => {
      expect(VALID_TRANSITIONS['PAID']).toEqual([]);
    });
  });

  describe('validateTransition', () => {
    it('should not throw for valid forward transition', () => {
      expect(() => validateTransition('UNASSIGNED', 'ASSIGNED')).not.toThrow();
    });

    it('should not throw for valid backward transition', () => {
      expect(() => validateTransition('ASSIGNED', 'UNASSIGNED')).not.toThrow();
    });

    it('should throw BadRequestException for invalid transition', () => {
      expect(() => validateTransition('UNASSIGNED', 'COMPLETED')).toThrow(
        BadRequestException,
      );
    });

    it('should throw for skipping states', () => {
      expect(() => validateTransition('UNASSIGNED', 'EN_ROUTE')).toThrow(
        BadRequestException,
      );
    });

    it('should throw for PAID -> any transition', () => {
      expect(() => validateTransition('PAID', 'UNASSIGNED')).toThrow(
        BadRequestException,
      );
    });

    it('should include from and to status in error message', () => {
      try {
        validateTransition('UNASSIGNED', 'COMPLETED');
      } catch (e: any) {
        expect(e.message).toContain('UNASSIGNED');
        expect(e.message).toContain('COMPLETED');
      }
    });
  });
});
