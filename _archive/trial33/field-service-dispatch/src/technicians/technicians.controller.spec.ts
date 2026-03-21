import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechniciansController } from './technicians.controller';
import { TechniciansService } from './technicians.service';

describe('TechniciansController', () => {
  let controller: TechniciansController;
  let service: any;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAvailable: vi.fn(),
    };
    controller = new TechniciansController(service as unknown as TechniciansService);
  });

  it('should call service.create with companyId and dto', async () => {
    const dto = { name: 'Tech', email: 'tech@test.com' };
    service.create.mockResolvedValue({ id: 't-1' });
    await controller.create('company-1', dto as any);
    expect(service.create).toHaveBeenCalledWith('company-1', dto);
  });

  it('should call service.findAll with companyId', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('company-1');
    expect(service.findAll).toHaveBeenCalledWith('company-1');
  });

  it('should call service.findAvailable with companyId', async () => {
    service.findAvailable.mockResolvedValue([]);
    await controller.findAvailable('company-1');
    expect(service.findAvailable).toHaveBeenCalledWith('company-1');
  });

  it('should call service.findOne with companyId and id', async () => {
    service.findOne.mockResolvedValue({ id: 't-1' });
    await controller.findOne('company-1', 't-1');
    expect(service.findOne).toHaveBeenCalledWith('company-1', 't-1');
  });

  it('should call service.update with companyId, id, and dto', async () => {
    service.update.mockResolvedValue({ id: 't-1' });
    await controller.update('company-1', 't-1', { name: 'Updated' } as any);
    expect(service.update).toHaveBeenCalledWith('company-1', 't-1', { name: 'Updated' });
  });

  it('should call service.delete with companyId and id', async () => {
    service.delete.mockResolvedValue({ id: 't-1' });
    await controller.delete('company-1', 't-1');
    expect(service.delete).toHaveBeenCalledWith('company-1', 't-1');
  });
});
