import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { JwtService } from '@nestjs/jwt';

describe('WorkOrdersController', () => {
  let controller: WorkOrdersController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      assignTechnician: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrdersController],
      providers: [
        { provide: WorkOrdersService, useValue: service },
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
      ],
    }).compile();

    controller = module.get<WorkOrdersController>(WorkOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create work order', async () => {
    const dto = { title: 'Fix AC', customerId: 'c1' };
    service.create.mockResolvedValue({ id: 'wo1', ...dto });
    const result = await controller.create('company-1', dto);
    expect(service.create).toHaveBeenCalledWith('company-1', dto);
    expect(result.id).toBe('wo1');
  });

  it('should find all work orders', async () => {
    service.findAll.mockResolvedValue([{ id: 'wo1' }]);
    const result = await controller.findAll('company-1');
    expect(result).toHaveLength(1);
  });

  it('should find one work order', async () => {
    service.findOne.mockResolvedValue({ id: 'wo1' });
    const result = await controller.findOne('company-1', 'wo1');
    expect(result.id).toBe('wo1');
  });

  it('should update status', async () => {
    service.updateStatus.mockResolvedValue({ id: 'wo1', status: 'EN_ROUTE' });
    const user = { sub: 'u1', email: 'a@b.com', companyId: 'c1', role: 'ADMIN' };
    const result = await controller.updateStatus('c1', 'wo1', { status: 'EN_ROUTE' as any }, user);
    expect(service.updateStatus).toHaveBeenCalledWith('c1', 'wo1', { status: 'EN_ROUTE' }, 'u1');
  });

  it('should assign technician', async () => {
    service.assignTechnician.mockResolvedValue({ id: 'wo1', technicianId: 't1' });
    const result = await controller.assignTechnician('c1', 'wo1', 't1');
    expect(service.assignTechnician).toHaveBeenCalledWith('c1', 'wo1', 't1');
  });

  it('should remove work order', async () => {
    service.remove.mockResolvedValue({ id: 'wo1' });
    await controller.remove('c1', 'wo1');
    expect(service.remove).toHaveBeenCalledWith('c1', 'wo1');
  });
});
