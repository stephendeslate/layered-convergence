import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { CompanyController } from './company.controller.js';
import { CompanyService } from './company.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [{ provide: CompanyService, useValue: mockService }],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a company', async () => {
    const dto = { name: 'Test Corp' };
    const expected = { id: '1', ...dto };
    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(dto);
    expect(result).toEqual(expected);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should find all companies', async () => {
    const expected = [{ id: '1', name: 'Test' }];
    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();
    expect(result).toEqual(expected);
  });

  it('should find one company', async () => {
    const expected = { id: '1', name: 'Test' };
    mockService.findOne.mockResolvedValue(expected);

    const result = await controller.findOne('1');
    expect(result).toEqual(expected);
  });

  it('should update a company', async () => {
    const dto = { name: 'Updated' };
    const expected = { id: '1', ...dto };
    mockService.update.mockResolvedValue(expected);

    const result = await controller.update('1', dto);
    expect(result).toEqual(expected);
  });

  it('should delete a company', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });

    const result = await controller.remove('1');
    expect(result).toEqual({ id: '1' });
  });
});
