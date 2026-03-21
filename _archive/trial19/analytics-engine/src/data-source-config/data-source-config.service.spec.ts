import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataSourceConfigService', () => {
  let service: DataSourceConfigService;
  let prisma: {
    dataSourceConfig: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const mockConfig = {
    id: 'config-1',
    dataSourceId: 'ds-1',
    connectionConfig: { host: 'localhost' },
    fieldMapping: { id: 'id' },
    transformSteps: [],
    syncSchedule: '0 * * * *',
  };

  beforeEach(async () => {
    prisma = {
      dataSourceConfig: {
        create: vi.fn().mockResolvedValue(mockConfig),
        findFirst: vi.fn().mockResolvedValue(mockConfig),
        update: vi.fn().mockResolvedValue({ ...mockConfig, syncSchedule: '*/5 * * * *' }),
        delete: vi.fn().mockResolvedValue(mockConfig),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DataSourceConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceConfigService>(DataSourceConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a config', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      connectionConfig: { host: 'localhost' },
      fieldMapping: { id: 'id' },
      syncSchedule: '0 * * * *',
    });
    expect(result).toEqual(mockConfig);
  });

  it('should find config by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result).toEqual(mockConfig);
    expect(prisma.dataSourceConfig.findFirst).toHaveBeenCalledWith({
      where: { dataSourceId: 'ds-1' },
    });
  });

  it('should throw NotFoundException when config not found by data source id', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDataSourceId('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a config', async () => {
    const result = await service.update('config-1', { syncSchedule: '*/5 * * * *' });
    expect(result.syncSchedule).toBe('*/5 * * * *');
  });

  it('should throw NotFoundException when updating non-existent config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { syncSchedule: '*/5 * * * *' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove a config', async () => {
    const result = await service.remove('config-1');
    expect(result).toEqual(mockConfig);
  });

  it('should throw NotFoundException when removing non-existent config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
