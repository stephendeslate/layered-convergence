import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyController } from './company.controller.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new CompanyController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create with dto', async () => {
    const dto = { name: 'Test' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto as any);
    expect(result.name).toBe('Test');
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should call findOne with id', async () => {
    mockService.findOne.mockResolvedValue({ id: '1', name: 'Co' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should call update with id and dto', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' } as any);
    expect(result.name).toBe('Updated');
  });

  it('should call remove with id', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1');
    expect(result.id).toBe('1');
  });
});
