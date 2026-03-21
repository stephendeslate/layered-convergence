import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: any;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };
    controller = new CompaniesController(service as unknown as CompaniesService);
  });

  it('should call service.create', async () => {
    const dto = { name: 'Test', slug: 'test' };
    service.create.mockResolvedValue({ id: 'c-1', ...dto });
    const result = await controller.create(dto);
    expect(result.id).toBe('c-1');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll', async () => {
    service.findAll.mockResolvedValue([{ id: 'c-1' }]);
    const result = await controller.findAll();
    expect(result).toHaveLength(1);
  });

  it('should call service.findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'c-1' });
    const result = await controller.findOne('c-1');
    expect(result.id).toBe('c-1');
  });

  it('should call service.update', async () => {
    service.update.mockResolvedValue({ id: 'c-1', name: 'Updated' });
    const result = await controller.update('c-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should call service.delete', async () => {
    service.delete.mockResolvedValue({ id: 'c-1' });
    const result = await controller.delete('c-1');
    expect(result.id).toBe('c-1');
  });
});
