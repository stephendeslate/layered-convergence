import { describe, it, expect, beforeEach } from 'vitest';
import { DashboardController } from './dashboard.controller';

function createMockService() {
  return {
    create: async (dto: any) => ({ id: 'dash-1', ...dto }),
    findAll: async () => [{ id: 'dash-1' }],
    findOne: async (id: string) => ({ id }),
    update: async (id: string, dto: any) => ({ id, ...dto }),
    remove: async (id: string) => ({ id }),
    publish: async (id: string) => ({ id, isPublished: true }),
    unpublish: async (id: string) => ({ id, isPublished: false }),
  } as any;
}

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(() => {
    controller = new DashboardController(createMockService());
  });

  it('should create a dashboard', async () => {
    const result = await controller.create({ tenantId: 't-1', name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('should find all dashboards', async () => {
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find one dashboard', async () => {
    const result = await controller.findOne('dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should update a dashboard', async () => {
    const result = await controller.update('dash-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a dashboard', async () => {
    const result = await controller.remove('dash-1');
    expect(result.id).toBe('dash-1');
  });

  it('should publish a dashboard', async () => {
    const result = await controller.publish('dash-1');
    expect(result.isPublished).toBe(true);
  });

  it('should unpublish a dashboard', async () => {
    const result = await controller.unpublish('dash-1');
    expect(result.isPublished).toBe(false);
  });
});
