import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('CompaniesController', () => {
  let controller: CompaniesController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [{ provide: CompaniesService, useValue: mockService }],
    }).compile();
    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    const dto = { name: 'ACME', slug: 'acme' } as any;
    mockService.create.mockResolvedValue({ id: 'c1' });
    await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: 'c1' });
    const result = await controller.findOne('c1');
    expect(result.id).toBe('c1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: 'c1' });
    await controller.update('c1', { name: 'Updated' } as any);
    expect(mockService.update).toHaveBeenCalledWith('c1', { name: 'Updated' });
  });

  it('should call delete', async () => {
    mockService.delete.mockResolvedValue({ id: 'c1' });
    await controller.delete('c1');
    expect(mockService.delete).toHaveBeenCalledWith('c1');
  });
});
