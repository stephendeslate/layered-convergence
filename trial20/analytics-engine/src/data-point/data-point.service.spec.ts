import { Test, TestingModule } from '@nestjs/testing';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let prisma: {
    dataPoint: { findMany: jest.Mock; create: jest.Mock; deleteMany: jest.Mock };
  };
  let tenantCtx: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        findMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<DataPointService>(DataPointService);
  });

  it('should find data points by data source', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([{ id: '1', value: '100.000000' }]);
    const result = await service.findByDataSource('ds-1', 'tenant-1');
    expect(tenantCtx.setContext).toHaveBeenCalledWith('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should create a data point with Decimal value', async () => {
    prisma.dataPoint.create.mockResolvedValue({ id: '1', value: '42.500000' });
    const result = await service.create(
      { value: '42.5', label: 'Revenue', dataSourceId: 'ds-1' },
      'tenant-1',
    );
    expect(result.value).toBe('42.500000');
  });

  it('should delete data points by data source', async () => {
    prisma.dataPoint.deleteMany.mockResolvedValue({ count: 5 });
    const result = await service.deleteByDataSource('ds-1', 'tenant-1');
    expect(result.count).toBe(5);
  });
});
