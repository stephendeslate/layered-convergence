import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller.js';
import { DataSourceService } from './data-source.service.js';

const mockDataSourceService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockRequest = { tenantId: 'tenant-1' };

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [
        { provide: DataSourceService, useValue: mockDataSourceService },
      ],
    }).compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const dto = { name: 'Source', type: 'API' as const };
      const expected = { id: '1', ...dto };
      mockDataSourceService.create.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.create(mockRequest as any, dto);

      expect(result).toEqual(expected);
      expect(mockDataSourceService.create).toHaveBeenCalledWith('tenant-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return data sources', async () => {
      mockDataSourceService.findAll.mockResolvedValue([]);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.findAll(mockRequest as any);

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a data source', async () => {
      const expected = { id: '1' };
      mockDataSourceService.findById.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.findById(mockRequest as any, '1');

      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      const dto = { name: 'Updated' };
      mockDataSourceService.update.mockResolvedValue({ id: '1', ...dto });

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.update(mockRequest as any, '1', dto);

      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      mockDataSourceService.remove.mockResolvedValue({ id: '1' });

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.remove(mockRequest as any, '1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
