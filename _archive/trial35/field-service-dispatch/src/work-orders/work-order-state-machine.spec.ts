import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { WorkOrderStatus } from '@prisma/client';
import { validateTransition, VALID_TRANSITIONS } from './work-order-state-machine';

describe('WorkOrderStateMachine', () => {
  it('should allow UNASSIGNED -> ASSIGNED', () => {
    expect(() => validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.ASSIGNED)).not.toThrow();
  });

  it('should allow ASSIGNED -> EN_ROUTE', () => {
    expect(() => validateTransition(WorkOrderStatus.ASSIGNED, WorkOrderStatus.EN_ROUTE)).not.toThrow();
  });

  it('should allow ASSIGNED -> UNASSIGNED (unassign)', () => {
    expect(() => validateTransition(WorkOrderStatus.ASSIGNED, WorkOrderStatus.UNASSIGNED)).not.toThrow();
  });

  it('should allow EN_ROUTE -> ON_SITE', () => {
    expect(() => validateTransition(WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ON_SITE)).not.toThrow();
  });

  it('should allow ON_SITE -> IN_PROGRESS', () => {
    expect(() => validateTransition(WorkOrderStatus.ON_SITE, WorkOrderStatus.IN_PROGRESS)).not.toThrow();
  });

  it('should allow IN_PROGRESS -> COMPLETED', () => {
    expect(() => validateTransition(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED)).not.toThrow();
  });

  it('should allow COMPLETED -> INVOICED', () => {
    expect(() => validateTransition(WorkOrderStatus.COMPLETED, WorkOrderStatus.INVOICED)).not.toThrow();
  });

  it('should allow INVOICED -> PAID', () => {
    expect(() => validateTransition(WorkOrderStatus.INVOICED, WorkOrderStatus.PAID)).not.toThrow();
  });

  it('should reject UNASSIGNED -> COMPLETED', () => {
    expect(() => validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.COMPLETED)).toThrow(
      BadRequestException,
    );
  });

  it('should reject PAID -> any transition', () => {
    for (const status of Object.values(WorkOrderStatus)) {
      if (status === WorkOrderStatus.PAID) continue;
      expect(() => validateTransition(WorkOrderStatus.PAID, status)).toThrow(BadRequestException);
    }
  });

  it('should reject skipping states', () => {
    expect(() => validateTransition(WorkOrderStatus.ASSIGNED, WorkOrderStatus.COMPLETED)).toThrow(
      BadRequestException,
    );
  });

  it('should include allowed transitions in error message', () => {
    try {
      validateTransition(WorkOrderStatus.UNASSIGNED, WorkOrderStatus.PAID);
      expect.unreachable();
    } catch (e: any) {
      expect(e.message).toContain('ASSIGNED');
      expect(e.message).toContain('UNASSIGNED');
      expect(e.message).toContain('PAID');
    }
  });

  it('should define all 8 statuses in VALID_TRANSITIONS', () => {
    const statuses = Object.values(WorkOrderStatus);
    expect(Object.keys(VALID_TRANSITIONS)).toHaveLength(statuses.length);
    for (const status of statuses) {
      expect(VALID_TRANSITIONS[status]).toBeDefined();
    }
  });

  it('should allow backward transitions EN_ROUTE -> ASSIGNED', () => {
    expect(() => validateTransition(WorkOrderStatus.EN_ROUTE, WorkOrderStatus.ASSIGNED)).not.toThrow();
  });

  it('should allow backward transitions ON_SITE -> EN_ROUTE', () => {
    expect(() => validateTransition(WorkOrderStatus.ON_SITE, WorkOrderStatus.EN_ROUTE)).not.toThrow();
  });

  it('should allow backward transitions IN_PROGRESS -> ON_SITE', () => {
    expect(() => validateTransition(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_SITE)).not.toThrow();
  });
});
