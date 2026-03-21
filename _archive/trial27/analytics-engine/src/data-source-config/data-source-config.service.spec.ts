import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  describe('create', () => {
    it('should create config with all fields', async () => {
      const dto = {
        dataSourceId: 'ds-1',
        connectionConfig: { host: 'localhost' },
        fieldMapping: { id: 'id' },
        syncSchedule: '0 * * * *',
      };
      prisma.dataSourceConfig.create.mockResolvedValue({ id: 'cfg-1', ...dto });
      const result = await service.create(dto);
      expect(result.id).toBe('cfg-1');
    });

    it('should default transformSteps to empty array', async () => {
      const dto = {
        dataSourceId: 'ds-1',
        connectionConfig: {},
        fieldMapping: {},
      };
      prisma.dataSourceConfig.create.mockResolvedValue({ id: 'cfg-1' });
      await service.create(dto);
      expect(prisma.dataSourceConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ transformSteps: [] }),
        }),
      );
    });
  });

  describe('findByDataSourceId', () => {
    it('should return config for data source', async () => {
      prisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'cfg-1', dataSourceId: 'ds-1' });
      const result = await service.findByDataSourceId('ds-1');
      expect(result.dataSourceId).toBe('ds-1');
    });

    it('should throw NotFoundException when config not found', async () => {
      prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
      await expect(service.findByDataSourceId('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update config fields', async () => {
      prisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'cfg-1' });
      prisma.dataSourceConfig.update.mockResolvedValue({ id: 'cfg-1', syncSchedule: '*/5 * * * *' });
      const result = await service.update('cfg-1', { syncSchedule: '*/5 * * * *' });
      expect(result.syncSchedule).toBe('*/5 * * * *');
    });

    it('should throw NotFoundException if config not found for update', async () => {
      prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete config', async () => {
      prisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'cfg-1' });
      prisma.dataSourceConfig.delete.mockResolvedValue({ id: 'cfg-1' });
      const result = await service.remove('cfg-1');
      expect(result.id).toBe('cfg-1');
    });

    it('should throw NotFoundException if config not found for delete', async () => {
      prisma.dataSourceConfig.findFirst.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
