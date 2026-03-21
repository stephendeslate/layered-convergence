import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  autoAssignNearest: vi.fn(),
};

const mockReq = { companyId: 'company-1' } as CompanyRequest;

describe('RouteController', () => {
  let controller: RouteController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [{ provide: RouteService, useValue: mockService }],
    }).compile();

    controller = module.get<RouteController>(RouteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a route', async () => {
      const dto = { waypoints: [{ lat: 40.7, lng: -74.0 }], technicianId: 'tech-1' };
      mockService.create.mockResolvedValue({ id: 'route-1' });

      const result = await controller.create(mockReq, dto);
      expect(result.id).toBe('route-1');
      expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return all routes', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'route-1' }]);
      const result = await controller.findAll(mockReq);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a route by id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'route-1' });
      const result = await controller.findOne(mockReq, 'route-1');
      expect(result.id).toBe('route-1');
    });
  });

  describe('update', () => {
    it('should update a route', async () => {
      mockService.update.mockResolvedValue({ id: 'route-1', name: 'Updated' });
      const result = await controller.update(mockReq, 'route-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a route', async () => {
      mockService.remove.mockResolvedValue({ id: 'route-1' });
      const result = await controller.remove(mockReq, 'route-1');
      expect(result.id).toBe('route-1');
    });
  });

  describe('autoAssign', () => {
    it('should auto-assign nearest technician', async () => {
      mockService.autoAssignNearest.mockResolvedValue({
        technician: { id: 'tech-1' },
        distance: 1.5,
        workOrderId: 'wo-1',
      });

      const result = await controller.autoAssign(mockReq, { workOrderId: 'wo-1' });
      expect(result.technician.id).toBe('tech-1');
      expect(result.distance).toBe(1.5);
    });
  });
});
