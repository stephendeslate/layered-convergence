import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersController', () => {
  let controller: WorkOrdersController;
  let service: any;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      transitionStatus: vi.fn(),
      autoAssign: vi.fn(),
      delete: vi.fn(),
    };
    controller = new WorkOrdersController(service as unknown as WorkOrdersService);
  });

  it('should call service.create with companyId and dto', async () => {
    const dto = { customerId: 'c-1', title: 'Test' };
    service.create.mockResolvedValue({ id: 'wo-1' });
    await controller.create('company-1', dto as any);
    expect(service.create).toHaveBeenCalledWith('company-1', dto);
  });

  it('should call service.findAll with companyId', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('company-1');
    expect(service.findAll).toHaveBeenCalledWith('company-1');
  });

  it('should call service.findOne with companyId and id', async () => {
    service.findOne.mockResolvedValue({ id: 'wo-1' });
    await controller.findOne('company-1', 'wo-1');
    expect(service.findOne).toHaveBeenCalledWith('company-1', 'wo-1');
  });

  it('should call service.update', async () => {
    service.update.mockResolvedValue({ id: 'wo-1' });
    await controller.update('company-1', 'wo-1', { title: 'Updated' } as any);
    expect(service.update).toHaveBeenCalledWith('company-1', 'wo-1', { title: 'Updated' });
  });

  it('should call service.transitionStatus', async () => {
    service.transitionStatus.mockResolvedValue({ id: 'wo-1', status: 'ASSIGNED' });
    await controller.transitionStatus('company-1', 'wo-1', { status: 'ASSIGNED' } as any);
    expect(service.transitionStatus).toHaveBeenCalledWith('company-1', 'wo-1', {
      status: 'ASSIGNED',
    });
  });

  it('should call service.autoAssign', async () => {
    service.autoAssign.mockResolvedValue({ id: 'wo-1' });
    await controller.autoAssign('company-1', 'wo-1');
    expect(service.autoAssign).toHaveBeenCalledWith('company-1', 'wo-1');
  });

  it('should call service.delete', async () => {
    service.delete.mockResolvedValue({ id: 'wo-1' });
    await controller.delete('company-1', 'wo-1');
    expect(service.delete).toHaveBeenCalledWith('company-1', 'wo-1');
  });
});
