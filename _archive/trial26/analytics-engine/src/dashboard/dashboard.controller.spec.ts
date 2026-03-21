import { describe, it, expect, beforeEach } from 'vitest';
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
    controller = new DashboardController(service as unknown as DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', () => {
    controller.create('t1', { name: 'DB' });
    expect(service.create).toHaveBeenCalledWith('t1', { name: 'DB' });
  });

  it('should call service.findAll', () => {
    controller.findAll('t1');
    expect(service.findAll).toHaveBeenCalledWith('t1');
  });

  it('should call service.findOne', () => {
    controller.findOne('t1', 'd1');
    expect(service.findOne).toHaveBeenCalledWith('t1', 'd1');
  });

  it('should call service.update', () => {
    controller.update('t1', 'd1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('t1', 'd1', { name: 'Updated' });
  });

  it('should call service.remove', () => {
    controller.remove('t1', 'd1');
    expect(service.remove).toHaveBeenCalledWith('t1', 'd1');
  });

  it('should return an SSE observable from events', () => {
    const obs = controller.events('d1');
    expect(obs).toBeDefined();
    expect(typeof obs.subscribe).toBe('function');
  });
});
