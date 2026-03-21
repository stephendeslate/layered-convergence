import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dataSource: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source without config', async () => {
      const dto = { name: 'My Source', type: 'POSTGRESQL' as const };
      const expected = { id: '1', tenantId, ...dto };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'My Source', type: 'POSTGRESQL', tenantId }),
        include: { dataSourceConfig: true },
      });
    });

    it('should create a data source with config', async () => {
      const dto = {
        name: 'API Source',
        type: 'API' as const,
        config: {
          connectionConfig: { url: 'https://api.example.com' },
          fieldMapping: { id: 'id' },
        },
      };
      const expected = { id: '1', tenantId, ...dto };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return data sources for a tenant', async () => {
      const sources = [{ id: '1', tenantId, name: 'Source 1' }];
      mockPrisma.dataSource.findMany.mockResolvedValue(sources);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(sources);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { dataSourceConfig: true },
      });
    });
  });

  describe('findById', () => {
    it('should return a data source', async () => {
      const source = { id: '1', tenantId };
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue(source);

      const result = await service.findById(tenantId, '1');

      expect(result).toEqual(source);
    });
  });

  describe('update', () => {
    it('should update a data source name', async () => {
      const dto = { name: 'Updated' };
      mockPrisma.dataSource.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update(tenantId, '1', dto);

      expect(result).toEqual({ id: '1', name: 'Updated' });
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      mockPrisma.dataSource.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove(tenantId, '1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
