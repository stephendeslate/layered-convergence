import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DispatchService } from '../dispatch.service';
import { PrismaService } from '../../prisma.service';

// TRACED: FD-TST-WO-001 — Dispatch service unit tests
describe('DispatchService', () => {
  let service: DispatchService;
  let prisma: {
    workOrder: { findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    workOrderTransition: { create: jest.Mock };
    $transaction: jest.Mock;
    setTenantContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      workOrderTransition: { create: jest.fn() },
      $transaction: jest.fn(),
      setTenantContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return paginated work orders', async () => {
    prisma.workOrder.findMany.mockResolvedValue([
      { id: '1', status: 'CREATED', technician: null, location: null },
    ]);
    const result = await service.findAll('tenant-1', 1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });

  it('should throw NotFoundException when work order not found', async () => {
    prisma.workOrder.findFirst.mockResolvedValue(null);
    await expect(service.findOne('x', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should reject invalid state transition', async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: '1', status: 'COMPLETED' });
    await expect(
      service.transition('1', 'ASSIGNED', 'user-1', 'tenant-1'),
    ).rejects.toThrow(BadRequestException);
  });
});
