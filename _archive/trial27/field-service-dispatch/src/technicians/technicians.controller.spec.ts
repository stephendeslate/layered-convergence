import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';
import { Reflector } from '@nestjs/core';

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
      providers: [
        { provide: TechniciansService, useValue: mockService },
        Reflector,
      ],
    }).compile();

    controller = module.get<TechniciansController>(TechniciansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create('comp-1', {
      name: 'Tech',
      email: 'tech@test.com',
    });
    expect(mockService.create).toHaveBeenCalledWith('comp-1', expect.any(Object));
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll('comp-1');
    expect(result).toEqual([]);
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('comp-1', '1');
    expect(result.id).toBe('1');
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
