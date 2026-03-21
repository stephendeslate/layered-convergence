import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service';

function createMockPrisma() {
  return {
    dashboard: {
      create: async (args: any) => ({ id: 'dash-1', ...args.data }),
      findMany: async () => [{ id: 'dash-1', name: 'Test Dashboard', widgets: [] }],
      findUniqueOrThrow: async () => ({
        id: 'dash-1',
        name: 'Test Dashboard',
        widgets: [],
        embedConfig: null,
      }),
      update: async (args: any) => ({ id: args.where.id, ...args.data }),
      delete: async (args: any) => ({ id: args.where.id }),
    },
  } as any;
}

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: any;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new DashboardService(prisma);
  });

  it('should create a dashboard', async () => {
    const result = await service.create({ tenantId: 't-1', name: 'My Dashboard' });
    expect(result.name).toBe('My Dashboard');
    expect(result.tenantId).toBe('t-1');
  });

  it('should find all dashboards', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find all dashboards filtered by tenantId', async () => {
    const result = await service.findAll('t-1');
    expect(result).toBeDefined();
  });

  it('should find one dashboard', async () => {
    const result = await service.findOne('dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should find dashboards by tenant', async () => {
    const result = await service.findByTenant('t-1');
    expect(result).toBeDefined();
  });

  it('should update a dashboard', async () => {
    const result = await service.update('dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    const result = await service.remove('dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should publish a dashboard', async () => {
    const result = await service.publish('dash-1');
    expect(result.isPublished).toBe(true);
  });

  it('should unpublish a dashboard', async () => {
    const result = await service.unpublish('dash-1');
    expect(result.isPublished).toBe(false);
  });
});
