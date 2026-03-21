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
    id: 'cfg-1',
    dataSourceId: 'ds-1',
    connectionConfig: { url: 'http://api.example.com' },
    fieldMapping: { name: 'full_name' },
    transformSteps: [],
    syncSchedule: '*/15 * * * *',
  };

  beforeEach(async () => {
    prisma = {
      dataSourceConfig: {
        create: vi.fn().mockResolvedValue(mockConfig),
        findFirst: vi.fn().mockResolvedValue(mockConfig),
        update: vi.fn().mockResolvedValue({ ...mockConfig, syncSchedule: '0 * * * *' }),
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
      connectionConfig: { url: 'http://api.example.com' },
      fieldMapping: { name: 'full_name' },
    });
    expect(result.id).toBe('cfg-1');
  });

  it('should find config by data source id', async () => {
    const result = await service.findByDataSourceId('ds-1');
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should throw NotFoundException when config not found', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDataSourceId('missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a config', async () => {
    const result = await service.update('cfg-1', { syncSchedule: '0 * * * *' });
    expect(result.syncSchedule).toBe('0 * * * *');
  });

  it('should throw NotFoundException when updating non-existent config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.update('missing', { syncSchedule: '0 * * * *' })).rejects.toThrow(NotFoundException);
  });

  it('should remove a config', async () => {
    await service.remove('cfg-1');
    expect(prisma.dataSourceConfig.delete).toHaveBeenCalledWith({ where: { id: 'cfg-1' } });
  });

  it('should throw NotFoundException when removing non-existent config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });

  it('should default transformSteps to empty array', async () => {
    await service.create({
      dataSourceId: 'ds-1',
      connectionConfig: { url: 'http://api.example.com' },
      fieldMapping: { name: 'full_name' },
    });
    expect(prisma.dataSourceConfig.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ transformSteps: [] }),
      }),
    );
  });
});
