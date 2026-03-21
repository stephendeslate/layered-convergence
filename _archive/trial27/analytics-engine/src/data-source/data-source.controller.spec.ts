import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';

describe('DataSourceController', () => {
  let controller: DataSourceController;
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
    controller = new DataSourceController(service as any);
  });

  it('should call service.create with tenantId and dto', async () => {
    const dto = { name: 'Test', type: 'postgresql' };
    service.create.mockResolvedValue({ id: 'ds-1' });
    await controller.create('t-1', dto);
    expect(service.create).toHaveBeenCalledWith('t-1', dto);
  });

  it('should call service.findAll with tenantId', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('t-1');
    expect(service.findAll).toHaveBeenCalledWith('t-1');
  });

  it('should call service.findOne with tenantId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'ds-1' });
    await controller.findOne('t-1', 'ds-1');
    expect(service.findOne).toHaveBeenCalledWith('t-1', 'ds-1');
  });

  it('should call service.update with tenantId, id, and dto', async () => {
    const dto = { name: 'Updated' };
    service.update.mockResolvedValue({ id: 'ds-1' });
    await controller.update('t-1', 'ds-1', dto);
    expect(service.update).toHaveBeenCalledWith('t-1', 'ds-1', dto);
  });

  it('should call service.remove with tenantId and id', async () => {
    service.remove.mockResolvedValue({ id: 'ds-1' });
    await controller.remove('t-1', 'ds-1');
    expect(service.remove).toHaveBeenCalledWith('t-1', 'ds-1');
  });
});
