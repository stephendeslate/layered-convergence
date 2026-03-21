import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { JwtService } from '@nestjs/jwt';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findByWorkOrder: vi.fn(),
      findByTechnician: vi.fn(),
      findOne: vi.fn(),
      unassign: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        { provide: AssignmentsService, useValue: service },
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { workOrderId: 'wo1', technicianId: 't1' };
    service.create.mockResolvedValue({ id: 'a1', ...dto });
    const result = await controller.create('company-1', dto);
    expect(service.create).toHaveBeenCalledWith('company-1', dto);
    expect(result.id).toBe('a1');
  });

  it('should call findByWorkOrder on service', async () => {
    service.findByWorkOrder.mockResolvedValue([{ id: 'a1' }]);
    const result = await controller.findByWorkOrder('company-1', 'wo1');
    expect(service.findByWorkOrder).toHaveBeenCalledWith('company-1', 'wo1');
    expect(result).toHaveLength(1);
  });

  it('should call findByTechnician on service', async () => {
    service.findByTechnician.mockResolvedValue([{ id: 'a1' }]);
    const result = await controller.findByTechnician('company-1', 't1');
    expect(service.findByTechnician).toHaveBeenCalledWith('company-1', 't1');
    expect(result).toHaveLength(1);
  });

  it('should call findOne on service', async () => {
    service.findOne.mockResolvedValue({ id: 'a1' });
    const result = await controller.findOne('a1');
    expect(service.findOne).toHaveBeenCalledWith('a1');
    expect(result.id).toBe('a1');
  });

  it('should call unassign on service', async () => {
    service.unassign.mockResolvedValue({ id: 'a1', active: false });
    const result = await controller.unassign('company-1', 'a1');
    expect(service.unassign).toHaveBeenCalledWith('company-1', 'a1');
    expect(result.active).toBe(false);
  });
});
