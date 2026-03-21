import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrderService } from '../src/modules/work-order/work-order.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('WorkOrderService - State Machine', () => {
  let service: WorkOrderService;
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    prisma = {
      workOrder: {
        create: vi.fn().mockResolvedValue({ id: 'wo1', status: 'unassigned' }),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 'wo1' }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        groupBy: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue({}),
      },
      workOrderStatusHistory: {
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation((fn: (tx: unknown) => unknown) =>
        fn({
          workOrder: { update: vi.fn().mockResolvedValue({ id: 'wo1' }) },
          workOrderStatusHistory: { create: vi.fn().mockResolvedValue({}) },
        }),
      ),
    };
    service = new WorkOrderService(prisma as unknown as PrismaService);
  });

  it('allows unassigned -> assigned', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'unassigned' });
    await expect(service.transition('wo1', 'assigned', 'Assigned to John', 'tech1')).resolves.toBeDefined();
  });

  it('allows assigned -> en_route', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'assigned' });
    await expect(service.transition('wo1', 'en_route')).resolves.toBeDefined();
  });

  it('allows en_route -> on_site', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'en_route' });
    await expect(service.transition('wo1', 'on_site')).resolves.toBeDefined();
  });

  it('allows on_site -> in_progress', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'on_site' });
    await expect(service.transition('wo1', 'in_progress')).resolves.toBeDefined();
  });

  it('allows in_progress -> completed', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'in_progress' });
    await expect(service.transition('wo1', 'completed')).resolves.toBeDefined();
  });

  it('allows completed -> invoiced', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'completed' });
    await expect(service.transition('wo1', 'invoiced')).resolves.toBeDefined();
  });

  it('allows invoiced -> paid', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'invoiced' });
    await expect(service.transition('wo1', 'paid')).resolves.toBeDefined();
  });

  it('rejects invalid: unassigned -> completed (throws BadRequestException)', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'unassigned' });
    await expect(service.transition('wo1', 'completed')).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid: paid -> unassigned (terminal state, throws BadRequestException)', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'paid' });
    await expect(service.transition('wo1', 'unassigned')).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid: en_route -> completed (skip states, throws BadRequestException)', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'en_route' });
    await expect(service.transition('wo1', 'completed')).rejects.toThrow(BadRequestException);
  });

  it('allows assigned -> unassigned (reassign)', async () => {
    prisma.workOrder.findUniqueOrThrow.mockResolvedValue({ id: 'wo1', status: 'assigned' });
    await expect(service.transition('wo1', 'unassigned', 'Reassigning')).resolves.toBeDefined();
  });
});
