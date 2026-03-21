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

  it('should call create on service', async () => {
    const dto = { title: 'Fix AC', customerId: 'c1' };
    service.create.mockResolvedValue({ id: 'wo1', ...dto });
    const result = await controller.create('company-1', dto as any);
    expect(service.create).toHaveBeenCalledWith('company-1', dto);
    expect(result.id).toBe('wo1');
  });

  it('should call findAll on service', async () => {
    service.findAll.mockResolvedValue([{ id: 'wo1' }]);
    const result = await controller.findAll('company-1');
    expect(result).toHaveLength(1);
  });

  it('should call findOne on service', async () => {
    service.findOne.mockResolvedValue({ id: 'wo1' });
    const result = await controller.findOne('company-1', 'wo1');
    expect(result.id).toBe('wo1');
  });

  it('should call updateStatus on service', async () => {
    const dto = { status: 'EN_ROUTE' };
    service.updateStatus.mockResolvedValue({ id: 'wo1', status: 'EN_ROUTE' });
    const user = { sub: 'u1', companyId: 'company-1', role: 'DISPATCHER' };
    const result = await controller.updateStatus('company-1', 'wo1', dto as any, user as any);
    expect(service.updateStatus).toHaveBeenCalledWith('company-1', 'wo1', dto, 'u1');
    expect(result.status).toBe('EN_ROUTE');
  });

  it('should call assignTechnician on service', async () => {
    service.assignTechnician.mockResolvedValue({ id: 'wo1', technicianId: 't1' });
    const result = await controller.assignTechnician('company-1', 'wo1', 't1');
    expect(service.assignTechnician).toHaveBeenCalledWith('company-1', 'wo1', 't1');
    expect(result.technicianId).toBe('t1');
  });

  it('should call remove on service', async () => {
    service.remove.mockResolvedValue({ id: 'wo1' });
    await controller.remove('company-1', 'wo1');
    expect(service.remove).toHaveBeenCalledWith('company-1', 'wo1');
  });
});
