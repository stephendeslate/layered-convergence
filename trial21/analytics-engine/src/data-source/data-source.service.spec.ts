import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';
import { NotFoundException } from '@nestjs/common';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: { findMany: jest.Mock; findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
  };
  let tenantContext: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantContext = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should find all data sources for a tenant', async () => {
    const sources = [{ id: '1', name: 'API', tenantId: 't1' }];
    prisma.dataSource.findMany.mockResolvedValue(sources);

    const result = await service.findAll('t1');
    expect(result).toEqual(sources);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    prisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 't2' });

    await expect(service.findById('1', 't1')).rejects.toThrow(NotFoundException);
  });

  it('should create a data source', async () => {
    const created = { id: '1', name: 'CSV', type: 'csv', tenantId: 't1' };
    prisma.dataSource.create.mockResolvedValue(created);

    const result = await service.create({ name: 'CSV', type: 'csv' }, 't1');
    expect(result).toEqual(created);
  });
});
