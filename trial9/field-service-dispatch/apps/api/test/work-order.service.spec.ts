import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderService } from '../src/modules/work-order/work-order.service';
import { PrismaService } from '../src/config/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('WorkOrderService — State Machine', () => {
  let service: WorkOrderService;
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    prisma = {
      workOrder: {
        create: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        delete: vi.fn(),
      },
      workOrderStatusHistory: {
        create: vi.fn(),
      },
      technician: {
        update: vi.fn(),
      },
    };
    service = new WorkOrderService(prisma as unknown as PrismaService);
  });

  it('should create work order in unassigned state without technician', async () => {
    prisma.workOrder.create.mockResolvedValue({ id: 'wo-1', status: 'unassigned' });

    const result = await service.create('company-1', {
      customerId: 'cust-1',
      title: 'Fix HVAC',
    });

    expect(result.status).toBe('unassigned');
  });

  it('should create work order in assigned state with technician', async () => {
    prisma.workOrder.create.mockResolvedValue({ id: 'wo-1', status: 'assigned' });

    const result = await service.create('company-1', {
      customerId: 'cust-1',
      title: 'Fix HVAC',
      technicianId: 'tech-1',
    });

    expect(result.status).toBe('assigned');
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { status: 'busy' },
    });
  });

  it('should transition assigned → en_route', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'assigned' });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'en_route' });

    const result = await service.transition('wo-1', 'en_route');
    expect(result.status).toBe('en_route');
  });

  it('should transition en_route → on_site', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'en_route' });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'on_site' });

    const result = await service.transition('wo-1', 'on_site');
    expect(result.status).toBe('on_site');
  });

  it('should transition on_site → in_progress', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'on_site' });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'in_progress' });

    const result = await service.transition('wo-1', 'in_progress');
    expect(result.status).toBe('in_progress');
  });

  it('should transition in_progress → completed and release technician', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({
      id: 'wo-1', status: 'in_progress', technicianId: 'tech-1',
    });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'completed' });

    const result = await service.transition('wo-1', 'completed');
    expect(result.status).toBe('completed');
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { status: 'available' },
    });
  });

  it('should throw BadRequestException for invalid transition unassigned → en_route', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'unassigned' });

    await expect(service.transition('wo-1', 'en_route')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid transition completed → assigned', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'completed' });

    await expect(service.transition('wo-1', 'assigned')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid transition en_route → completed (skip steps)', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'en_route' });

    await expect(service.transition('wo-1', 'completed')).rejects.toThrow(BadRequestException);
  });

  it('should assign work order and update technician status', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'unassigned' });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'assigned' });

    await service.assign('wo-1', 'tech-1');

    expect(prisma.workOrder.update).toHaveBeenCalledWith({
      where: { id: 'wo-1' },
      data: { technicianId: 'tech-1', status: 'assigned' },
    });
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 'tech-1' },
      data: { status: 'busy' },
    });
  });

  it('should record status history on every transition', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo-1', status: 'assigned' });
    prisma.workOrder.update.mockResolvedValue({ id: 'wo-1', status: 'en_route' });

    await service.transition('wo-1', 'en_route', 'Starting route');

    expect(prisma.workOrderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        workOrderId: 'wo-1',
        fromStatus: 'assigned',
        toStatus: 'en_route',
        note: 'Starting route',
      }),
    });
  });
});
