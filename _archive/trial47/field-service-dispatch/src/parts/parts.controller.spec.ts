import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PartsController } from './parts.controller';
import { PartsService } from './parts.service';
import { JwtService } from '@nestjs/jwt';

describe('PartsController', () => {
  let controller: PartsController;
  let service: any;

  beforeEach(async () => {
    service = {
      create: vi.fn(),
      findByWorkOrder: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PartsController],
      providers: [
        { provide: PartsService, useValue: service },
        { provide: JwtService, useValue: { verifyAsync: vi.fn() } },
      ],
    }).compile();

    controller = module.get<PartsController>(PartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create on service', async () => {
    const dto = { workOrderId: 'wo1', name: 'Filter' };
    service.create.mockResolvedValue({ id: 'p1', ...dto });
    const result = await controller.create('company-1', dto);
    expect(service.create).toHaveBeenCalledWith('company-1', dto);
    expect(result.id).toBe('p1');
  });

  it('should call findByWorkOrder on service', async () => {
    service.findByWorkOrder.mockResolvedValue([{ id: 'p1' }]);
    const result = await controller.findByWorkOrder('company-1', 'wo1');
    expect(service.findByWorkOrder).toHaveBeenCalledWith('company-1', 'wo1');
    expect(result).toHaveLength(1);
  });

  it('should call findOne on service', async () => {
    service.findOne.mockResolvedValue({ id: 'p1' });
    const result = await controller.findOne('p1');
    expect(service.findOne).toHaveBeenCalledWith('p1');
    expect(result.id).toBe('p1');
  });

  it('should call update on service', async () => {
    service.update.mockResolvedValue({ id: 'p1', installed: true });
    const result = await controller.update('company-1', 'p1', { installed: true });
    expect(service.update).toHaveBeenCalledWith('company-1', 'p1', { installed: true });
    expect(result.installed).toBe(true);
  });

  it('should call remove on service', async () => {
    service.remove.mockResolvedValue({ id: 'p1' });
    const result = await controller.remove('company-1', 'p1');
    expect(service.remove).toHaveBeenCalledWith('company-1', 'p1');
    expect(result.id).toBe('p1');
  });
});
