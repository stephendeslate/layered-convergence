import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataSourcesService', () => {
  let service: DataSourcesService;
  let prisma: any;

  const mockDataSource = {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'Test Source',
    type: 'API',
    pipelineStatus: 'DRAFT',
    dataSourceConfig: null,
    syncRuns: [],
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: vi.fn().mockResolvedValue(mockDataSource),
        findMany: vi.fn().mockResolvedValue([mockDataSource]),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(mockDataSource),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourcesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourcesService>(DataSourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const result = await service.create({
        tenantId: 'tenant-1',
        name: 'Test Source',
        type: 'API',
      });
      expect(result).toEqual(mockDataSource);
    });
  });

  describe('findAll', () => {
    it('should return data sources for a tenant', async () => {
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return data source when found', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(mockDataSource);
      const result = await service.findById('ds-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should transition DRAFT -> ACTIVE', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({ ...mockDataSource, pipelineStatus: 'DRAFT' });
      prisma.dataSource.update.mockResolvedValue({ ...mockDataSource, pipelineStatus: 'ACTIVE' });

      const result = await service.updateStatus('ds-1', 'ACTIVE');
      expect(result.pipelineStatus).toBe('ACTIVE');
    });

    it('should throw BadRequestException for invalid transition', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({ ...mockDataSource, pipelineStatus: 'DRAFT' });

      await expect(service.updateStatus('ds-1', 'PAUSED')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for ARCHIVED -> anything', async () => {
      prisma.dataSource.findUnique.mockResolvedValue({ ...mockDataSource, pipelineStatus: 'ARCHIVED' });

      await expect(service.updateStatus('ds-1', 'ACTIVE')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update name when no pipelineStatus', async () => {
      prisma.dataSource.update.mockResolvedValue({ ...mockDataSource, name: 'New Name' });
      const result = await service.update('ds-1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should delete data source', async () => {
      await service.remove('ds-1');
      expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });
  });
});
