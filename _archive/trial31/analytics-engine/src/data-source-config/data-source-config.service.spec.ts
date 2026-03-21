import { DataSourceConfigService } from './data-source-config.service';

const mockPrisma = {
  dataSourceConfig: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DataSourceConfigService', () => {
  let service: DataSourceConfigService;

  beforeEach(() => {
    service = new DataSourceConfigService(mockPrisma as any);
    vi.clearAllMocks();
  });

  it('should create a config', async () => {
    const dto = { dataSourceId: 'ds1', connectionConfig: { host: 'localhost' } };
    mockPrisma.dataSourceConfig.create.mockResolvedValue({ id: '1', ...dto });
    const result = await service.create(dto as any);
    expect(result.dataSourceId).toBe('ds1');
  });

  it('should find config by data source', async () => {
    mockPrisma.dataSourceConfig.findUnique.mockResolvedValue({ id: '1', dataSourceId: 'ds1' });
    const result = await service.findByDataSource('ds1');
    expect(result?.dataSourceId).toBe('ds1');
  });

  it('should return null if no config found', async () => {
    mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(null);
    const result = await service.findByDataSource('ds1');
    expect(result).toBeNull();
  });

  it('should find one config by id', async () => {
    mockPrisma.dataSourceConfig.findUniqueOrThrow.mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should update a config', async () => {
    mockPrisma.dataSourceConfig.update.mockResolvedValue({ id: '1', syncSchedule: '*/5 * * * *' });
    const result = await service.update('1', { syncSchedule: '*/5 * * * *' } as any);
    expect(result.syncSchedule).toBe('*/5 * * * *');
  });

  it('should remove a config', async () => {
    mockPrisma.dataSourceConfig.delete.mockResolvedValue({ id: '1' });
    await service.remove('1');
    expect(mockPrisma.dataSourceConfig.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
