import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourcesService } from './data-sources.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataSourcesService', () => {
  let service: DataSourcesService;
  let prisma: any;

  const mockDs = {
    id: 'ds-1',
    name: 'Test DS',
    type: 'api',
    connectionConfig: {},
    fieldMapping: {},
    syncSchedule: null,
    organizationId: 'org-1',
    transformations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findMany: vi.fn().mockResolvedValue([mockDs]),
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockDs),
        update: vi.fn().mockResolvedValue(mockDs),
        delete: vi.fn().mockResolvedValue(mockDs),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DataSourcesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourcesService>(DataSourcesService);
  });

  describe('findAll', () => {
    it('should return data sources for org', async () => {
      const result = await service.findAll('org-1');
      expect(result).toEqual([mockDs]);
    });
  });

  describe('findOne', () => {
    it('should return data source by id', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(mockDs);
      const result = await service.findOne('ds-1');
      expect(result).toEqual(mockDs);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a data source', async () => {
      await service.create({ name: 'New', type: 'csv' }, 'org-1');
      expect(prisma.dataSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New',
          type: 'csv',
          organizationId: 'org-1',
        }),
      });
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      await service.update('ds-1', { name: 'Updated' });
      expect(prisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        data: { name: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      await service.remove('ds-1');
      expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });
  });
});
