import { describe, it, expect, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';

function createMockPrisma() {
  return {
    dataSource: {
      create: async (args: any) => ({ id: 'ds-1', status: 'active', ...args.data }),
      findMany: async () => [{ id: 'ds-1', name: 'Test Source', dataSourceConfig: null }],
      findUniqueOrThrow: async () => ({
        id: 'ds-1',
        name: 'Test Source',
        status: 'active',
        dataSourceConfig: null,
        syncRuns: [],
      }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    service = new DataSourceService(createMockPrisma());
  });

  it('should create a data source', async () => {
    const result = await service.create({ tenantId: 't-1', name: 'API Source', type: 'api' });
    expect(result.name).toBe('API Source');
    expect(result.type).toBe('api');
  });

  it('should find all data sources', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find data sources by tenant', async () => {
    const result = await service.findAll('t-1');
    expect(result).toBeDefined();
  });

  it('should find one data source', async () => {
    const result = await service.findOne('ds-1');
    expect(result.id).toBe('ds-1');
  });

  it('should update a data source name', async () => {
    const result = await service.update('ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should allow valid status transition active -> paused', async () => {
    const result = await service.update('ds-1', { status: 'paused' });
    expect(result.status).toBe('paused');
  });

  it('should allow valid status transition active -> archived', async () => {
    const result = await service.update('ds-1', { status: 'archived' });
    expect(result.status).toBe('archived');
  });

  it('should reject invalid status transition active -> pending', async () => {
    await expect(service.update('ds-1', { status: 'pending' as any })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should delete a data source', async () => {
    const result = await service.remove('ds-1');
    expect(result.id).toBe('ds-1');
  });
});
