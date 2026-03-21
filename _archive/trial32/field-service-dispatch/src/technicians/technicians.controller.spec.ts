import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAvailable: vi.fn(),
};

describe('TechniciansController', () => {
  let controller: TechniciansController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [TechniciansController],
      providers: [{ provide: TechniciansService, useValue: mockService }],
    }).compile();

    controller = module.get(TechniciansController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with companyId', async () => {
    const dto = { name: 'John', email: 'john@test.com' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create('comp-1', dto);
    expect(mockService.create).toHaveBeenCalledWith('comp-1', dto);
    expect(result.name).toBe('John');
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('comp-1');
    expect(mockService.findAll).toHaveBeenCalledWith('comp-1');
  });

  it('should call findAvailable', async () => {
    mockService.findAvailable.mockResolvedValue([]);
    await controller.findAvailable('comp-1');
    expect(mockService.findAvailable).toHaveBeenCalledWith('comp-1');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    await controller.findOne('comp-1', '1');
    expect(mockService.findOne).toHaveBeenCalledWith('comp-1', '1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: '1' });
    await controller.update('comp-1', '1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('comp-1', '1', { name: 'Updated' });
  });

  it('should call delete', async () => {
    mockService.delete.mockResolvedValue({ id: '1' });
    await controller.delete('comp-1', '1');
    expect(mockService.delete).toHaveBeenCalledWith('comp-1', '1');
  });
});
