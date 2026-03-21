import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('TechniciansController', () => {
  let controller: TechniciansController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechniciansController],
      providers: [{ provide: TechniciansService, useValue: mockService }],
    }).compile();
    controller = module.get<TechniciansController>(TechniciansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with companyId', async () => {
    const dto = { name: 'John', email: 'john@test.com' } as any;
    mockService.create.mockResolvedValue({ id: 't1' });
    await controller.create('comp1', dto);
    expect(mockService.create).toHaveBeenCalledWith('comp1', dto);
  });

  it('should call findAll with status filter', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('comp1', 'AVAILABLE' as any);
    expect(mockService.findAll).toHaveBeenCalledWith('comp1', 'AVAILABLE');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 't1' });
    await controller.findOne('comp1', 't1');
    expect(mockService.findOne).toHaveBeenCalledWith('comp1', 't1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: 't1' });
    await controller.update('comp1', 't1', { name: 'Jane' } as any);
    expect(mockService.update).toHaveBeenCalledWith('comp1', 't1', { name: 'Jane' });
  });

  it('should call delete', async () => {
    mockService.delete.mockResolvedValue({ id: 't1' });
    await controller.delete('comp1', 't1');
    expect(mockService.delete).toHaveBeenCalledWith('comp1', 't1');
  });
});
