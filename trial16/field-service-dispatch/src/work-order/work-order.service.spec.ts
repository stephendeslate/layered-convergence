import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderService, VALID_TRANSITIONS } from './work-order.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkOrderStatus, WorkOrderPriority } from '@prisma/client';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    technician: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const companyId = 'company-1';
  const otherCompanyId = 'company-2';

  const mockWorkOrder = {
    id: 'wo-1',
    title: 'Fix HVAC Unit',
    description: 'AC not cooling properly',
    status: WorkOrderStatus.CREATED,
    priority: WorkOrderPriority.MEDIUM,
    customerId: 'cust-1',
    technicianId: null,
    companyId,
    completedAt: null,
    customer: { id: 'cust-1', name: 'Acme Corp' },
    technician: null,
    invoices: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      workOrder: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
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

  describe('create', () => {
    it('should create a work order with CREATED status by default', async () => {
      prisma.workOrder.create.mockResolvedValue(mockWorkOrder);

      const result = await service.create(companyId, {
        title: 'Fix HVAC Unit',
        description: 'AC not cooling properly',
        customerId: 'cust-1',
      });

      expect(result.status).toBe(WorkOrderStatus.CREATED);
      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ companyId, title: 'Fix HVAC Unit' }),
        }),
      );
    });

    it('should create with ASSIGNED status when technicianId provided', async () => {
      prisma.workOrder.create.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
        technicianId: 'tech-1',
      });

      await service.create(companyId, {
        title: 'Fix HVAC',
        technicianId: 'tech-1',
      });

      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WorkOrderStatus.ASSIGNED,
            technicianId: 'tech-1',
          }),
        }),
      );
    });

    it('should default priority to MEDIUM', async () => {
      prisma.workOrder.create.mockResolvedValue(mockWorkOrder);

      await service.create(companyId, { title: 'Test' });

      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: WorkOrderPriority.MEDIUM }),
        }),
      );
    });

    it('should accept custom priority', async () => {
      prisma.workOrder.create.mockResolvedValue({
        ...mockWorkOrder,
        priority: WorkOrderPriority.URGENT,
      });

      await service.create(companyId, {
        title: 'Emergency',
        priority: WorkOrderPriority.URGENT,
      });

      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: WorkOrderPriority.URGENT }),
        }),
      );
    });

    it('should parse scheduledAt as Date', async () => {
      prisma.workOrder.create.mockResolvedValue(mockWorkOrder);

      await service.create(companyId, {
        title: 'Scheduled',
        scheduledAt: '2026-04-01T10:00:00Z',
      });

      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scheduledAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should include customer and technician in response', async () => {
      prisma.workOrder.create.mockResolvedValue(mockWorkOrder);

      await service.create(companyId, { title: 'Test' });

      expect(prisma.workOrder.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { customer: true, technician: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all work orders for the company', async () => {
      prisma.workOrder.findMany.mockResolvedValue([mockWorkOrder]);

      const result = await service.findAll(companyId);

      expect(result).toHaveLength(1);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId },
        }),
      );
    });

    it('should filter by status when provided', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);

      await service.findAll(companyId, WorkOrderStatus.ASSIGNED);

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId, status: WorkOrderStatus.ASSIGNED },
        }),
      );
    });

    it('should order by createdAt descending', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);

      await service.findAll(companyId);

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return empty array when no work orders exist', async () => {
      prisma.workOrder.findMany.mockResolvedValue([]);

      const result = await service.findAll(companyId);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a work order with relations', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);

      const result = await service.findById(companyId, 'wo-1');

      expect(result).toEqual(mockWorkOrder);
      expect(prisma.workOrder.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'wo-1', companyId },
          include: { customer: true, technician: true, invoices: true },
        }),
      );
    });

    it('should throw NotFoundException when work order not found', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findById(companyId, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not return work orders from other companies', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.findById(otherCompanyId, 'wo-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update work order fields', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        title: 'Updated Title',
      });

      const result = await service.update(companyId, 'wo-1', {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.update(companyId, 'bad', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.workOrder.delete.mockResolvedValue(mockWorkOrder);

      const result = await service.remove(companyId, 'wo-1');
      expect(result).toEqual(mockWorkOrder);
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(service.remove(companyId, 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition — valid transitions', () => {
    it('should transition CREATED → ASSIGNED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CREATED,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.ASSIGNED);
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should transition ASSIGNED → EN_ROUTE', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.EN_ROUTE,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.EN_ROUTE);
      expect(result.status).toBe(WorkOrderStatus.EN_ROUTE);
    });

    it('should transition EN_ROUTE → IN_PROGRESS', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.EN_ROUTE,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS);
      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });

    it('should transition IN_PROGRESS → ON_HOLD', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ON_HOLD,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.ON_HOLD);
      expect(result.status).toBe(WorkOrderStatus.ON_HOLD);
    });

    it('should transition ON_HOLD → IN_PROGRESS (resume)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ON_HOLD,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS);
      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });

    it('should transition IN_PROGRESS → COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.COMPLETED,
        completedAt: new Date(),
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED);
      expect(result.status).toBe(WorkOrderStatus.COMPLETED);
    });

    it('should transition COMPLETED → INVOICED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.COMPLETED,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.INVOICED,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.INVOICED);
      expect(result.status).toBe(WorkOrderStatus.INVOICED);
    });

    it('should transition INVOICED → PAID', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.INVOICED,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.PAID,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.PAID);
      expect(result.status).toBe(WorkOrderStatus.PAID);
    });

    it('should transition PAID → CLOSED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.PAID,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CLOSED,
      });

      const result = await service.transition(companyId, 'wo-1', WorkOrderStatus.CLOSED);
      expect(result.status).toBe(WorkOrderStatus.CLOSED);
    });
  });

  describe('transition — completedAt', () => {
    it('should set completedAt when transitioning to COMPLETED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.COMPLETED,
        completedAt: new Date(),
      });

      await service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED);

      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WorkOrderStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should NOT set completedAt for other transitions', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CREATED,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
      });

      await service.transition(companyId, 'wo-1', WorkOrderStatus.ASSIGNED);

      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: WorkOrderStatus.ASSIGNED },
        }),
      );
    });
  });

  describe('transition — invalid transitions', () => {
    it('should reject CREATED → COMPLETED (skip)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CREATED,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject CREATED → EN_ROUTE (skip)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CREATED,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.EN_ROUTE),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject CLOSED → any (terminal state)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CLOSED,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.CREATED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject COMPLETED → IN_PROGRESS (backward)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.COMPLETED,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ASSIGNED → COMPLETED (skip)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject ON_HOLD → COMPLETED (not allowed)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ON_HOLD,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject EN_ROUTE → ASSIGNED (backward)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.EN_ROUTE,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.ASSIGNED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject self-transition (same status)', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
      });

      await expect(
        service.transition(companyId, 'wo-1', WorkOrderStatus.ASSIGNED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.transition(companyId, 'nonexistent', WorkOrderStatus.ASSIGNED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition — ON_HOLD cycle', () => {
    it('should allow pause/resume cycle: IN_PROGRESS → ON_HOLD → IN_PROGRESS', async () => {
      // Step 1: IN_PROGRESS → ON_HOLD
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ON_HOLD,
      });

      let result = await service.transition(companyId, 'wo-1', WorkOrderStatus.ON_HOLD);
      expect(result.status).toBe(WorkOrderStatus.ON_HOLD);

      // Step 2: ON_HOLD → IN_PROGRESS
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ON_HOLD,
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });

      result = await service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS);
      expect(result.status).toBe(WorkOrderStatus.IN_PROGRESS);
    });

    it('should allow multiple pause/resume cycles', async () => {
      for (let i = 0; i < 3; i++) {
        prisma.workOrder.findFirst.mockResolvedValue({
          ...mockWorkOrder,
          status: WorkOrderStatus.IN_PROGRESS,
        });
        prisma.workOrder.update.mockResolvedValue({
          ...mockWorkOrder,
          status: WorkOrderStatus.ON_HOLD,
        });

        await service.transition(companyId, 'wo-1', WorkOrderStatus.ON_HOLD);

        prisma.workOrder.findFirst.mockResolvedValue({
          ...mockWorkOrder,
          status: WorkOrderStatus.ON_HOLD,
        });
        prisma.workOrder.update.mockResolvedValue({
          ...mockWorkOrder,
          status: WorkOrderStatus.IN_PROGRESS,
        });

        await service.transition(companyId, 'wo-1', WorkOrderStatus.IN_PROGRESS);
      }

      expect(prisma.workOrder.update).toHaveBeenCalledTimes(6);
    });
  });

  describe('assign', () => {
    it('should assign a technician from the same company', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.technician.findFirst.mockResolvedValue({
        id: 'tech-1',
        companyId,
        name: 'John',
      });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        technicianId: 'tech-1',
        status: WorkOrderStatus.ASSIGNED,
      });

      const result = await service.assign(companyId, 'wo-1', 'tech-1');

      expect(result.technicianId).toBe('tech-1');
      expect(result.status).toBe(WorkOrderStatus.ASSIGNED);
    });

    it('should auto-transition to ASSIGNED when work order is CREATED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.CREATED,
      });
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.ASSIGNED,
      });

      await service.assign(companyId, 'wo-1', 'tech-1');

      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: WorkOrderStatus.ASSIGNED,
            technicianId: 'tech-1',
          }),
        }),
      );
    });

    it('should NOT change status when work order is not CREATED', async () => {
      prisma.workOrder.findFirst.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
      });
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId });
      prisma.workOrder.update.mockResolvedValue({
        ...mockWorkOrder,
        status: WorkOrderStatus.IN_PROGRESS,
        technicianId: 'tech-1',
      });

      await service.assign(companyId, 'wo-1', 'tech-1');

      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { technicianId: 'tech-1' },
        }),
      );
    });

    it('should throw ForbiddenException for technician from different company', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.technician.findFirst.mockResolvedValue(null); // Not found in same company

      await expect(
        service.assign(companyId, 'wo-1', 'tech-other-company'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for non-existent technician', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(mockWorkOrder);
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(companyId, 'wo-1', 'nonexistent'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent work order', async () => {
      prisma.workOrder.findFirst.mockResolvedValue(null);

      await expect(
        service.assign(companyId, 'nonexistent', 'tech-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCountsByStatus', () => {
    it('should return counts for all statuses', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { status: WorkOrderStatus.CREATED, _count: { status: 5 } },
        { status: WorkOrderStatus.ASSIGNED, _count: { status: 3 } },
      ]);

      const result = await service.getCountsByStatus(companyId);

      expect(result[WorkOrderStatus.CREATED]).toBe(5);
      expect(result[WorkOrderStatus.ASSIGNED]).toBe(3);
      expect(result[WorkOrderStatus.CLOSED]).toBe(0);
    });

    it('should return zero for all statuses when no work orders exist', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([]);

      const result = await service.getCountsByStatus(companyId);

      for (const status of Object.values(WorkOrderStatus)) {
        expect(result[status]).toBe(0);
      }
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for CREATED', () => {
      const transitions = service.getValidTransitions(WorkOrderStatus.CREATED);
      expect(transitions).toEqual([WorkOrderStatus.ASSIGNED]);
    });

    it('should return valid transitions for IN_PROGRESS', () => {
      const transitions = service.getValidTransitions(WorkOrderStatus.IN_PROGRESS);
      expect(transitions).toContain(WorkOrderStatus.ON_HOLD);
      expect(transitions).toContain(WorkOrderStatus.COMPLETED);
    });

    it('should return valid transitions for ON_HOLD', () => {
      const transitions = service.getValidTransitions(WorkOrderStatus.ON_HOLD);
      expect(transitions).toEqual([WorkOrderStatus.IN_PROGRESS]);
    });

    it('should return empty array for CLOSED', () => {
      const transitions = service.getValidTransitions(WorkOrderStatus.CLOSED);
      expect(transitions).toHaveLength(0);
    });

    it('should have all 9 statuses in VALID_TRANSITIONS map', () => {
      const statuses = Object.values(WorkOrderStatus);
      expect(Object.keys(VALID_TRANSITIONS)).toHaveLength(statuses.length);
      for (const status of statuses) {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      }
    });
  });
});
