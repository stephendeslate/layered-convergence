import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';

describe('DataSourceConfigService', () => {
  let service: DataSourceConfigService;
  let mockPrisma: any;

  const mockConfig = {
    id: 'cfg-1',
    dataSourceId: 'ds-1',
    connectionConfig: { host: 'localhost' },
    fieldMapping: { name: 'name' },
    transformSteps: [],
    syncSchedule: '*/15 * * * *',
  };

  beforeEach(() => {
    mockPrisma = {
      dataSourceConfig: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new DataSourceConfigService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a config', async () => {
      mockPrisma.dataSourceConfig.create.mockResolvedValue(mockConfig);
      const result = await service.create({
        dataSourceId: 'ds-1',
        connectionConfig: { host: 'localhost' },
        fieldMapping: { name: 'name' },
        syncSchedule: '*/15 * * * *',
      });
      expect(result).toEqual(mockConfig);
    });

    it('should use defaults for optional fields', async () => {
      mockPrisma.dataSourceConfig.create.mockResolvedValue(mockConfig);
      await service.create({ dataSourceId: 'ds-1' });
      expect(mockPrisma.dataSourceConfig.create).toHaveBeenCalledWith({
        data: {
          dataSourceId: 'ds-1',
          connectionConfig: {},
          fieldMapping: {},
          transformSteps: [],
          syncSchedule: null,
        },
      });
    });
  });

  describe('findByDataSource', () => {
    it('should return config by dataSourceId', async () => {
      mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(mockConfig);
      const result = await service.findByDataSource('ds-1');
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException when config not found', async () => {
      mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(null);
      await expect(service.findByDataSource('ds-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update config', async () => {
      mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(mockConfig);
      mockPrisma.dataSourceConfig.update.mockResolvedValue({ ...mockConfig, syncSchedule: '0 * * * *' });
      const result = await service.update('ds-1', { syncSchedule: '0 * * * *' });
      expect(result.syncSchedule).toBe('0 * * * *');
    });
  });

  describe('remove', () => {
    it('should delete config', async () => {
      mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(mockConfig);
      mockPrisma.dataSourceConfig.delete.mockResolvedValue(mockConfig);
      const result = await service.remove('ds-1');
      expect(result).toEqual(mockConfig);
    });
  });
});
