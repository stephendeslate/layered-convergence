import { DataPointService } from './data-point.service';

const mockPrisma = {
  dataPoint: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DataPointService', () => {
  let service: DataPointService;

  beforeEach(() => {
    service = new DataPointService(mockPrisma as any);
    vi.clearAllMocks();
  });

  it('should create a data point', async () => {
    const dto = { dataSourceId: 'ds1', timestamp: '2024-01-01T00:00:00Z', metrics: { views: 100 } };
    mockPrisma.dataPoint.create.mockResolvedValue({ id: '1', ...dto });
    const result = await service.create(dto);
    expect(result.id).toBe('1');
    expect(mockPrisma.dataPoint.create).toHaveBeenCalledWith({
      data: {
        dataSourceId: 'ds1',
        timestamp: expect.any(Date),
        dimensions: {},
        metrics: { views: 100 },
      },
    });
  });

  it('should find all data points', async () => {
    mockPrisma.dataPoint.findMany.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  });

  it('should filter by dataSourceId', async () => {
    mockPrisma.dataPoint.findMany.mockResolvedValue([]);
    await service.findAll('ds1');
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: { dataSourceId: 'ds1' },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
  });

  it('should find one data point', async () => {
    mockPrisma.dataPoint.findUniqueOrThrow.mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result.id).toBe('1');
  });

  it('should find data points by date range', async () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    mockPrisma.dataPoint.findMany.mockResolvedValue([]);
    await service.findByDateRange('ds1', start, end);
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: {
        dataSourceId: 'ds1',
        timestamp: { gte: start, lte: end },
      },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should remove a data point', async () => {
    mockPrisma.dataPoint.delete.mockResolvedValue({ id: '1' });
    await service.remove('1');
    expect(mockPrisma.dataPoint.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
