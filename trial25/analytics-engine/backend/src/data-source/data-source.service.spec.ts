import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant/tenant-context.service';

// [TRACED:TS-003] Unit test for DataSourceService with mocked dependencies
describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: { findMany: jest.Mock; findFirst: jest.Mock; create: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setTenantContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should list all data sources for a tenant', async () => {
    prisma.dataSource.findMany.mockResolvedValue([{ id: 'ds-1', name: 'Postgres' }]);
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.findOne('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a data source', async () => {
    prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', name: 'MySQL Source' });
    const result = await service.create({
      name: 'MySQL Source',
      type: 'MYSQL',
      connectionUri: 'mysql://localhost',
      tenantId: 'tenant-1',
    });
    expect(result.name).toBe('MySQL Source');
  });
});
