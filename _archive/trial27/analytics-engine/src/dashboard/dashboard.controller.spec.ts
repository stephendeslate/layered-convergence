import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    controller = new DashboardController(service as any);
  });

  it('should call service.create with tenantId and dto', async () => {
    const dto = { name: 'Test' };
    service.create.mockResolvedValue({ id: 'd-1' });
    await controller.create('t-1', dto);
    expect(service.create).toHaveBeenCalledWith('t-1', dto);
  });

  it('should call service.findAll with tenantId', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('t-1');
    expect(service.findAll).toHaveBeenCalledWith('t-1');
  });

  it('should call service.findOne with tenantId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'd-1' });
    await controller.findOne('t-1', 'd-1');
    expect(service.findOne).toHaveBeenCalledWith('t-1', 'd-1');
  });

  it('should call service.update', async () => {
    const dto = { name: 'Updated' };
    service.update.mockResolvedValue({ id: 'd-1' });
    await controller.update('t-1', 'd-1', dto);
    expect(service.update).toHaveBeenCalledWith('t-1', 'd-1', dto);
  });

  it('should call service.remove', async () => {
    service.remove.mockResolvedValue({ id: 'd-1' });
    await controller.remove('t-1', 'd-1');
    expect(service.remove).toHaveBeenCalledWith('t-1', 'd-1');
  });

  it('should return an observable for events', () => {
    const observable = controller.events('d-1');
    expect(observable).toBeDefined();
    expect(observable.subscribe).toBeDefined();
  });
});
