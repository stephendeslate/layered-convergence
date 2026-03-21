import { describe, it, expect, beforeEach } from 'vitest';
import { DataSourceConfigService } from './data-source-config.service';

function createMockPrisma() {
  return {
    dataSourceConfig: {
      create: async (args: any) => ({ id: 'dsc-1', ...args.data }),
      findUnique: async () => ({ id: 'dsc-1', dataSourceId: 'ds-1', fieldMapping: {} }),
      findUniqueOrThrow: async () => ({ id: 'dsc-1', dataSourceId: 'ds-1' }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('DataSourceConfigService', () => {
  let service: DataSourceConfigService;

  beforeEach(() => {
    service = new DataSourceConfigService(createMockPrisma());
  });

  it('should create a data source config', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      connectionConfig: { url: 'https://api.example.com' },
    });
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should find config by data source', async () => {
    const result = await service.findByDataSource('ds-1');
    expect(result).toBeDefined();
    expect(result!.dataSourceId).toBe('ds-1');
  });

  it('should find one config', async () => {
    const result = await service.findOne('dsc-1');
    expect(result.id).toBe('dsc-1');
  });

  it('should update a config', async () => {
    const result = await service.update('dsc-1', {
      fieldMapping: { name: 'user_name' },
    });
    expect(result.fieldMapping).toEqual({ name: 'user_name' });
  });

  it('should delete a config', async () => {
    const result = await service.remove('dsc-1');
    expect(result.id).toBe('dsc-1');
  });

  it('should create config with transform steps', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      transformSteps: [{ type: 'rename', config: { from: 'a', to: 'b' } }],
    });
    expect(result.transformSteps).toHaveLength(1);
  });

  it('should create config with sync schedule', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      syncSchedule: '*/15 * * * *',
    });
    expect(result.syncSchedule).toBe('*/15 * * * *');
  });
});
