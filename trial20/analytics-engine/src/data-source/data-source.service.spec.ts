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
  let tenantCtx: { setContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
    };
    tenantCtx = { setContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantCtx },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should find all data sources for a tenant', async () => {
    prisma.dataSource.findMany.mockResolvedValue([{ id: '1', name: 'DS' }]);
    const result = await service.findAll('tenant-1');
    expect(tenantCtx.setContext).toHaveBeenCalledWith('tenant-1');
    expect(result).toHaveLength(1);
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad-id', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException for wrong tenant', async () => {
    prisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 'other-tenant' });
    await expect(service.findById('1', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('should create a data source', async () => {
    prisma.dataSource.create.mockResolvedValue({ id: '1', name: 'New DS', tenantId: 'tenant-1' });
    const result = await service.create({ name: 'New DS', type: 'api' }, 'tenant-1');
    expect(result.name).toBe('New DS');
  });

  it('should delete a data source', async () => {
    prisma.dataSource.findUnique.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
    prisma.dataSource.delete.mockResolvedValue({ id: '1' });
    await service.delete('1', 'tenant-1');
    expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});
