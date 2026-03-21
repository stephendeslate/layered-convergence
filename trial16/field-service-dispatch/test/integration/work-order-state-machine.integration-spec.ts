import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderService, VALID_TRANSITIONS } from '../../src/work-order/work-order.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

/**
 * Work Order State Machine Integration Tests
 *
 * These tests validate the complete work order lifecycle including:
 * - All 9 states: CREATED, ASSIGNED, EN_ROUTE, IN_PROGRESS, ON_HOLD, COMPLETED, INVOICED, PAID, CLOSED
 * - ON_HOLD pause/resume cycle
 * - Invalid transition rejection
 * - completedAt timestamp verification
 * - Technician company-boundary validation
 */
describe('Work Order State Machine (Integration)', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    technician: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const companyId = 'company-1';
  const otherCompanyId = 'company-2';

  const createMockWorkOrder = (status: WorkOrderStatus, overrides = {}) => ({
    id: 'wo-1',
    title: 'Integration Test Work Order',
    description: 'Testing state machine',
    status,
    priority: WorkOrderPriority.MEDIUM,
    customerId: 'cust-1',
    technicianId: 'tech-1',
    companyId,
    completedAt: null,
    scheduledAt: null,
    customer: { id: 'cust-1', name: 'Test Customer' },
    technician: { id: 'tech-1', name: 'Test Tech', companyId },
    invoices: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(() => {
    prisma = {
      workOrder: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        groupBy: vi.fn(),
      },
      technician: {
        findFirst: vi.fn(),
      },
    };
    service = new WorkOrderService(prisma as unknown as PrismaService);
  });

  it('should follow full lifecycle: CREATED → ASSIGNED → EN_ROUTE → IN_PROGRESS → COMPLETED → INVOICED → PAID → CLOSED', async () => {
    const statuses = [
      WorkOrderStatus.CREATED,
      WorkOrderStatus.ASSIGNED,
      WorkOrderStatus.EN_ROUTE,
      WorkOrderStatus.IN_PROGRESS,
      WorkOrderStatus.COMPLETED,
      WorkOrderStatus.INVOICED,
      WorkOrderStatus.PAID,
      WorkOrderStatus.CLOSED,
    ];

    for (let i = 0; i < statuses.length - 1; i++) {
      const currentStatus = statuses[i];
      const nextStatus = statuses[i + 1];

      prisma.workOrder.findFirst.mockResolvedValue(createMockWorkOrder(currentStatus));
      prisma.workOrder.update.mockResolvedValue(createMockWorkOrder(nextStatus));

      const result = await service.transition(companyId, 'wo-1', nextStatus);
      expect(result.status).toBe(nextStatus);
    }
  });

  it('should handle ON_HOLD in lifecycle: CREATED → ... → IN_PROGRESS → ON_HOLD → IN_PROGRESS → COMPLETED → ... → CLOSED', async () => {
    const transitions: [WorkOrderStatus, WorkOrderStatus][] = [
      [WorkOrderStatus.CREATED, WorkOrderStatus.ASSIGNED],
      [WorkOrderStatus.ASSIGNED, WorkOrderStatus.EN_ROUTE],
      [WorkOrderStatus.EN_ROUTE, WorkOrderStatus.IN_PROGRESS],
      [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD],
      [WorkOrderStatus.ON_HOLD, WorkOrderStatus.IN_PROGRESS],
      [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.COMPLETED],
      [WorkOrderStatus.COMPLETED, WorkOrderStatus.INVOICED],
      [WorkOrderStatus.INVOICED, WorkOrderStatus.PAID],
      [WorkOrderStatus.PAID, WorkOrderStatus.CLOSED],
    ];

    for (const [from, to] of transitions) {
      prisma.workOrder.findFirst.mockResolvedValue(createMockWorkOrder(from));
      prisma.workOrder.update.mockResolvedValue(createMockWorkOrder(to));

      const result = await service.transition(companyId, 'wo-1', to);
      expect(result.status).toBe(to);
    }
  });

  it('should allow ON_HOLD → IN_PROGRESS (pause/resume)', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.ON_HOLD),
    );
    prisma.workOrder.update.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.IN_PROGRESS),
    );

    const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS);
    expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
  });

  it('should allow multiple pause/resume cycles', async () => {
    for (let cycle = 0; cycle < 3; cycle++) {
      // Pause: IN_PROGRESS → ON_HOLD
      prisma.workOrder.findFirst.mockResolvedValue(
        createMockWorkOrder(WorkOrderStatus.IN_PROGRESS),
      );
      prisma.workOrder.update.mockResolvedValue(
        createMockWorkOrder(WorkOrderStatus.ON_HOLD),
      );
      const paused = await service.transition(companyId, 'wo-1', WorkOrderStatus.ON_HOLD);
      expect(paused.status).toBe(WorkOrderStatus.ON_HOLD);

      // Resume: ON_HOLD → IN_PROGRESS
      prisma.workOrder.findFirst.mockResolvedValue(
        createMockWorkOrder(WorkOrderStatus.ON_HOLD),
      );
      prisma.workOrder.update.mockResolvedValue(
        createMockWorkOrder(WorkOrderStatus.IN_PROGRESS),
      );
      const resumed = await service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS);
      expect(resumed.status).toBe(WorkOrderStatus.IN_PROGRESS);
    }
  });

  it('should reject CREATED → COMPLETED (skipping states)', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.CREATED),
    );

    await expect(
      service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject CREATED → EN_ROUTE (skipping ASSIGNED)', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.CREATED),
    );

    await expect(
      service.transition(companyId, 'wo-1', WorkOrderStatus.EN_ROUTE),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject COMPLETED → IN_PROGRESS (backward transition)', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.COMPLETED),
    );

    await expect(
      service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject all transitions from CLOSED (terminal state)', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.CLOSED),
    );

    for (const status of Object.values(WorkOrderStatus)) {
      if (status === WorkOrderStatus.CLOSED) continue;
      await expect(
        service.transition(companyId, 'wo-1', status),
      ).rejects.toThrow(BadRequestException);
    }
  });

  it('should set completedAt when transitioning to COMPLETED', async () => {
    const beforeTime = new Date();

    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.IN_PROGRESS),
    );
    prisma.workOrder.update.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.COMPLETED, { completedAt: new Date() }),
    );

    await service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED);

    expect(prisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completedAt: expect.any(Date),
        }),
      }),
    );

    const callData = prisma.workOrder.update.mock.calls[0][0].data;
    expect(callData.completedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
  });

  it('should NOT set completedAt for non-COMPLETED transitions', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.CREATED),
    );
    prisma.workOrder.update.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.ASSIGNED),
    );

    await service.transition(companyId, 'wo-1', WorkOrderStatus.ASSIGNED);

    const callData = prisma.workOrder.update.mock.calls[0][0].data;
    expect(callData.completedAt).toBeUndefined();
  });

  it('should validate technician belongs to same company on assign', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.CREATED),
    );
    prisma.technician.findFirst.mockResolvedValue(null); // Technician not found in company

    await expect(
      service.assign(companyId, 'wo-1', 'tech-other-company'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow assigning technician from same company', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.CREATED),
    );
    prisma.technician.findFirst.mockResolvedValue({
      id: 'tech-1',
      companyId,
      name: 'Same Company Tech',
    });
    prisma.workOrder.update.mockResolvedValue(
      createMockWorkOrder(WorkOrderStatus.ASSIGNED, { technicianId: 'tech-1' }),
    );

    const result = await service.assign(companyId, 'wo-1', 'tech-1');
    expect(result.technicianId).toBe('tech-1');
  });

  it('should have valid transitions for all 9 states', () => {
    const allStatuses = Object.values(WorkOrderStatus);
    expect(allStatuses).toHaveLength(9);

    for (const status of allStatuses) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
      expect(Array.isArray(VALID_TRANSITIONS[status])).toBe(true);
    }
  });
});
