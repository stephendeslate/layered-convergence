import { describe, it, expect, beforeEach } from 'vitest';
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
    controller = new DataSourceController(service as unknown as DataSourceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with tenantId and dto', () => {
    const dto = { name: 'Test', type: 'api' };
    controller.create('t1', dto);
    expect(service.create).toHaveBeenCalledWith('t1', dto);
  });

  it('should call service.findAll with tenantId', () => {
    controller.findAll('t1');
    expect(service.findAll).toHaveBeenCalledWith('t1');
  });

  it('should call service.findOne with tenantId and id', () => {
    controller.findOne('t1', 'ds-1');
    expect(service.findOne).toHaveBeenCalledWith('t1', 'ds-1');
  });

  it('should call service.update with tenantId, id, and dto', () => {
    const dto = { name: 'Updated' };
    controller.update('t1', 'ds-1', dto);
    expect(service.update).toHaveBeenCalledWith('t1', 'ds-1', dto);
  });

  it('should call service.remove with tenantId and id', () => {
    controller.remove('t1', 'ds-1');
    expect(service.remove).toHaveBeenCalledWith('t1', 'ds-1');
  });
});
