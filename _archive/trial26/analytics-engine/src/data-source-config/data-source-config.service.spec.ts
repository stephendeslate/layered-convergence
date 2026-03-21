import { describe, it, expect, beforeEach } from 'vitest';
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

  beforeEach(async () => {
    prisma = {
      dataSourceConfig: {
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DataSourceConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DataSourceConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a data source config', async () => {
    prisma.dataSourceConfig.create.mockResolvedValue({ id: 'c1' });
    const result = await service.create({
      dataSourceId: 'ds1',
      connectionConfig: { host: 'localhost' },
      fieldMapping: { name: 'name' },
    });
    expect(result.id).toBe('c1');
  });

  it('should create with default transform steps', async () => {
    prisma.dataSourceConfig.create.mockResolvedValue({ id: 'c1' });
    await service.create({
      dataSourceId: 'ds1',
      connectionConfig: {},
      fieldMapping: {},
    });
    expect(prisma.dataSourceConfig.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transformSteps: [],
      }),
    });
  });

  it('should find config by data source id', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'c1' });
    const result = await service.findByDataSourceId('ds1');
    expect(result.id).toBe('c1');
  });

  it('should throw NotFoundException when config not found', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.findByDataSourceId('bad')).rejects.toThrow(NotFoundException);
  });

  it('should update a config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.dataSourceConfig.update.mockResolvedValue({ id: 'c1', syncSchedule: '*/5 * * * *' });
    const result = await service.update('c1', { syncSchedule: '*/5 * * * *' });
    expect(result.syncSchedule).toBe('*/5 * * * *');
  });

  it('should throw NotFoundException when updating non-existent config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.update('bad', {})).rejects.toThrow(NotFoundException);
  });

  it('should delete a config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'c1' });
    prisma.dataSourceConfig.delete.mockResolvedValue({ id: 'c1' });
    await service.remove('c1');
    expect(prisma.dataSourceConfig.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
  });

  it('should throw NotFoundException when removing non-existent config', async () => {
    prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
    await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
  });
});
