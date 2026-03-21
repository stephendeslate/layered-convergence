import { TenantController } from './tenant.controller';

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
    controller = new TenantController(mockService as any);
    vi.clearAllMocks();
  });

  it('should call create', async () => {
    const dto = { name: 'Test' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto);
    expect(result.id).toBe('1');
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should call findAll', async () => {
    mockService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
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

  it('should call regenerateApiKey', async () => {
    mockService.regenerateApiKey.mockResolvedValue({ id: '1', apiKey: 'new' });
    const result = await controller.regenerateApiKey('1');
    expect(result.apiKey).toBe('new');
  });
});
