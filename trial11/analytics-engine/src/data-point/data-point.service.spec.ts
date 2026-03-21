import { Test, TestingModule } from '@nestjs/testing';
import { DataPointService } from './data-point.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dataPoint: {
    findMany: vi.fn(),
  },
};

describe('DataPointService', () => {
  let service: DataPointService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DataPointService>(DataPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('query', () => {
    it('should query data points with date range', async () => {
      const dataPoints = [
        {
          id: '1',
          timestamp: new Date('2024-01-01'),
          metrics: { revenue: 100 },
          dimensions: {},
        },
      ];
      mockPrisma.dataPoint.findMany.mockResolvedValue(dataPoints);

      const result = await service.query(tenantId, {
        dataSourceId: 'ds-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(result).toEqual(dataPoints);
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          dataSourceId: 'ds-1',
          timestamp: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should group by time bucket when groupBy is specified', async () => {
      const dataPoints = [
        {
          id: '1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          metrics: { revenue: 100 },
        },
        {
          id: '2',
          timestamp: new Date('2024-01-01T14:00:00Z'),
          metrics: { revenue: 200 },
        },
      ];
      mockPrisma.dataPoint.findMany.mockResolvedValue(dataPoints);

      const result = await service.query(tenantId, {
        dataSourceId: 'ds-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day',
      });

      expect(result).toHaveLength(1);
      // type assertion justified: result is dynamic based on groupBy path
      const grouped = result as Array<{ bucket: string; metrics: Record<string, number>; count: number }>;
      expect(grouped[0].bucket).toBe('2024-01-01');
      expect(grouped[0].metrics.revenue).toBe(300);
      expect(grouped[0].count).toBe(2);
    });
  });
});
