import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderService } from './work-order.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      workOrder: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      workOrderStatusHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn((fn: Function) => fn(prisma)),
    };
    service = new WorkOrderService(prisma as unknown as PrismaService);
  });

  it('should create a work order with unassigned status when no technician', async () => {
    const dto = {
      customerId: 'cust1',
      priority: 'high',
      title: 'Fix HVAC unit',
    };
    prisma.workOrder.create.mockResolvedValue({
      id: 'wo1',
      status: 'unassigned',
      ...dto,
    });

    const result = await service.create('company1', dto);
    expect(result.status).toBe('unassigned');
  });

  it('should transition from unassigned to assigned', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'unassigned',
      companyId: 'company1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'assigned',
      statusHistory: [],
    });

    const result = await service.transition('wo1', 'company1', {
      status: 'assigned',
    });
    expect(result.status).toBe('assigned');
  });

  it('should transition from assigned to en_route', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'assigned',
      companyId: 'company1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'en_route',
      statusHistory: [],
    });

    const result = await service.transition('wo1', 'company1', {
      status: 'en_route',
    });
    expect(result.status).toBe('en_route');
  });

  it('should transition through full lifecycle', async () => {
    const states = [
      'unassigned',
      'assigned',
      'en_route',
      'on_site',
      'in_progress',
      'completed',
      'invoiced',
      'paid',
    ];

    for (let i = 0; i < states.length - 1; i++) {
      prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
        id: 'wo1',
        status: states[i],
        companyId: 'company1',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo1',
        status: states[i + 1],
        statusHistory: [],
      });

      const result = await service.transition('wo1', 'company1', {
        status: states[i + 1],
      });
      expect(result.status).toBe(states[i + 1]);
    }
  });

  it('should reject invalid transition from unassigned to completed', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'unassigned',
      companyId: 'company1',
    });

    await expect(
      service.transition('wo1', 'company1', { status: 'completed' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition from paid (terminal state)', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'paid',
      companyId: 'company1',
    });

    await expect(
      service.transition('wo1', 'company1', { status: 'unassigned' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow unassigning an assigned work order', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'assigned',
      companyId: 'company1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'unassigned',
      statusHistory: [],
    });

    const result = await service.transition('wo1', 'company1', {
      status: 'unassigned',
    });
    expect(result.status).toBe('unassigned');
  });

  it('should assign a technician to unassigned work order', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'unassigned',
      companyId: 'company1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'assigned',
      technicianId: 'tech1',
    });

    const result = await service.assign('wo1', 'company1', 'tech1');
    expect(result.status).toBe('assigned');
  });

  it('should reject assignment for non-unassigned work order', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'en_route',
      companyId: 'company1',
    });

    await expect(
      service.assign('wo1', 'company1', 'tech1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should log status history on transition', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'unassigned',
      companyId: 'company1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'assigned',
      statusHistory: [],
    });

    await service.transition('wo1', 'company1', {
      status: 'assigned',
      note: 'Assigned manually',
    });

    expect(prisma.workOrderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workOrderId: 'wo1',
        fromStatus: 'unassigned',
        toStatus: 'assigned',
        note: 'Assigned manually',
      }),
    });
  });

  it('should set completedAt when transitioning to completed', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo1',
      status: 'in_progress',
      companyId: 'company1',
    });
    prisma.workOrder.update.mockResolvedValue({
      id: 'wo1',
      status: 'completed',
      statusHistory: [],
    });

    await service.transition('wo1', 'company1', { status: 'completed' });

    expect(prisma.workOrder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(Date),
        }),
      }),
    );
  });
});
