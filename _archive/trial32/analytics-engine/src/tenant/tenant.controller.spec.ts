import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantController } from './tenant.controller.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  regenerateApiKey: vi.fn(),
};

describe('TenantController', () => {
  let controller: TenantController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new TenantController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    mockService.create.mockResolvedValue({ id: '1', name: 'Acme' });
    const result = await controller.create({ name: 'Acme' });
    expect(result.name).toBe('Acme');
    expect(mockService.create).toHaveBeenCalledWith({ name: 'Acme' });
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
    mockService.update.mockResolvedValue({ id: '1', name: 'New' });
    const result = await controller.update('1', { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    const result = await controller.remove('1');
    expect(result.id).toBe('1');
  });

  it('should call regenerateApiKey', async () => {
    mockService.regenerateApiKey.mockResolvedValue({
      id: '1',
      apiKey: 'ak_new',
    });
    const result = await controller.regenerateApiKey('1');
    expect(result.apiKey).toBe('ak_new');
  });
});
