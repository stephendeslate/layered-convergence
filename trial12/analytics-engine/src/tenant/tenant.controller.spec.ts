import { TenantController } from './tenant.controller.js';

describe('TenantController', () => {
  let controller: TenantController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      regenerateApiKey: vi.fn(),
    };
    controller = new TenantController(mockService);
  });

  it('should call create', async () => {
    mockService.create.mockResolvedValue({ id: '1' });
    const result = await controller.create({ name: 'Test' });
    expect(result).toEqual({ id: '1' });
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
    const result = await controller.update('1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    await controller.remove('1');
    expect(mockService.remove).toHaveBeenCalledWith('1');
  });

  it('should call regenerateApiKey', async () => {
    mockService.regenerateApiKey.mockResolvedValue({ id: '1', apiKey: 'new' });
    await controller.regenerateApiKey('1');
    expect(mockService.regenerateApiKey).toHaveBeenCalledWith('1');
  });
});
