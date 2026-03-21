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
        create: vi.fn().mockResolvedValue(mockConfig),
        findUnique: vi.fn().mockResolvedValue(mockConfig),
        update: vi.fn().mockResolvedValue({ ...mockConfig, syncSchedule: '0 * * * *' }),
        delete: vi.fn().mockResolvedValue(mockConfig),
      },
    };
    service = new DataSourceConfigService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a config', async () => {
    const result = await service.create({ dataSourceId: 'ds-1', connectionConfig: { host: 'localhost' } });
    expect(result).toEqual(mockConfig);
  });

  it('should find config by data source id', async () => {
    const result = await service.findByDataSource('ds-1');
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should throw NotFoundException when config not found', async () => {
    mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(null);
    await expect(service.findByDataSource('ds-999')).rejects.toThrow(NotFoundException);
  });

  it('should update a config', async () => {
    const result = await service.update('ds-1', { syncSchedule: '0 * * * *' });
    expect(result.syncSchedule).toBe('0 * * * *');
  });

  it('should delete a config', async () => {
    const result = await service.remove('ds-1');
    expect(result).toEqual(mockConfig);
  });

  it('should throw NotFoundException when updating non-existent config', async () => {
    mockPrisma.dataSourceConfig.findUnique.mockResolvedValue(null);
    await expect(service.update('ds-999', { syncSchedule: '0 * * * *' })).rejects.toThrow(NotFoundException);
  });
});
