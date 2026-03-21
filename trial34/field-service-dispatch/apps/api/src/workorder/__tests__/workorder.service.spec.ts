import { Test } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkOrderService } from '../workorder.service';
import { PrismaService } from '../../prisma.service';

// TRACED: FD-TA-UNIT-002 — Work order service unit tests
describe('WorkOrderService', () => {
  let service: WorkOrderService;
  let prisma: {
    setTenantContext: jest.Mock;
    workOrder: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      setTenantContext: jest.fn(),
      workOrder: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(WorkOrderService);
  });

  it('should reject invalid status values', async () => {
    await expect(
      service.updateStatus('1', 'INVALID', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid state transitions', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED' });
    await expect(
      service.updateStatus('1', 'IN_PROGRESS', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should allow valid transitions CREATED -> ASSIGNED', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'CREATED' });
    prisma.workOrder.update.mockResolvedValue({ id: '1', status: 'ASSIGNED' });

    const result = await service.updateStatus('1', 'ASSIGNED', 'tenant-1');
    expect(result.status).toBe('ASSIGNED');
  });

  it('should throw NotFoundException when work order not found', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);
    await expect(
      service.updateStatus('missing', 'ASSIGNED', 'tenant-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create work order with slugified title', async () => {
    prisma.workOrder.create.mockResolvedValue({
      id: '1',
      title: 'Fix HVAC Unit',
      slug: 'fix-hvac-unit',
      status: 'CREATED',
    });

    await service.create('Fix HVAC Unit', 'desc', 'HIGH', 'tenant-1');
    expect(prisma.workOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'fix-hvac-unit' }),
      }),
    );
  });
});
