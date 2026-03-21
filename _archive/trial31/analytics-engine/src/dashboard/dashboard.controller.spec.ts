import { DashboardController } from './dashboard.controller';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  publish: vi.fn(),
  unpublish: vi.fn(),
  remove: vi.fn(),
};

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(() => {
    controller = new DashboardController(mockService as any);
    vi.clearAllMocks();
  });

  it('should call create', async () => {
    const dto = { tenantId: 't1', name: 'D1' };
    mockService.create.mockResolvedValue({ id: '1', ...dto });
    const result = await controller.create(dto);
    expect(result.id).toBe('1');
  });

  it('should call findAll without tenantId', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should call findAll with tenantId', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll('t1');
    expect(mockService.findAll).toHaveBeenCalledWith('t1');
  });

  it('should call findOne', async () => {
    mockService.findOne.mockResolvedValue({ id: '1' });
    const result = await controller.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should call update', async () => {
    mockService.update.mockResolvedValue({ id: '1' });
    await controller.update('1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('1', { name: 'Updated' });
  });

  it('should call publish', async () => {
    mockService.publish.mockResolvedValue({ id: '1', isPublished: true });
    const result = await controller.publish('1');
    expect(result.isPublished).toBe(true);
  });

  it('should call unpublish', async () => {
    mockService.unpublish.mockResolvedValue({ id: '1', isPublished: false });
    const result = await controller.unpublish('1');
    expect(result.isPublished).toBe(false);
  });

  it('should call remove', async () => {
    mockService.remove.mockResolvedValue({ id: '1' });
    await controller.remove('1');
    expect(mockService.remove).toHaveBeenCalledWith('1');
  });
});
