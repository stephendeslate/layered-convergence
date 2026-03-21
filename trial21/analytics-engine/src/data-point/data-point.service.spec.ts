import { Test, TestingModule } from '@nestjs/testing';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let prisma: {
    dataPoint: { findMany: jest.Mock; create: jest.Mock; deleteMany: jest.Mock };
  };
  let tenantContext: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DataPointService>(DataPointService);
  });

  it('should find data points by data source', async () => {
    const points = [{ id: '1', value: '100.5', label: 'Revenue' }];
    prisma.dataPoint.findMany.mockResolvedValue(points);

    const result = await service.findByDataSource('ds-1', 't1');
    expect(result).toEqual(points);
    expect(tenantContext.setContext).toHaveBeenCalledWith('t1');
  });

  it('should create a data point with Decimal value', async () => {
    const created = { id: '1', value: '99.123456', label: 'Metric' };
    prisma.dataPoint.create.mockResolvedValue(created);

    const result = await service.create(
      { value: '99.123456', label: 'Metric', dataSourceId: 'ds-1' },
      't1',
    );
    expect(result).toEqual(created);
  });

  it('should delete data points by data source', async () => {
    prisma.dataPoint.deleteMany.mockResolvedValue({ count: 5 });

    const result = await service.deleteByDataSource('ds-1', 't1');
    expect(result.count).toBe(5);
  });
});
