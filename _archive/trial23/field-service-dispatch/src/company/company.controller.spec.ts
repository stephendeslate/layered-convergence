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

  it('should call create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'Test' });
    const result = await controller.create({ name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1' }]);
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1');
    expect(result.id).toBe('1');
  });
});
