import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { RouteController } from './route.controller.js';
import { RouteService } from './route.service.js';

const mockService = {
  create: vi.fn(),
  findByTechnician: vi.fn(),
  findOne: vi.fn(),
};

describe('RouteController', () => {
  let controller: RouteController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [RouteController],
      providers: [{ provide: RouteService, useValue: mockService }],
    }).compile();

    controller = module.get<RouteController>(RouteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto', async () => {
      const dto = { technicianId: 'tech-1', date: '2026-04-01', waypoints: [] };
      mockService.create.mockResolvedValue({ id: 'route-1' });

      await controller.create(dto as any);
      expect(mockService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findByTechnician', () => {
    it('should call service.findByTechnician with technicianId', async () => {
      mockService.findByTechnician.mockResolvedValue([]);

      await controller.findByTechnician('tech-1');
      expect(mockService.findByTechnician).toHaveBeenCalledWith('tech-1');
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id', async () => {
      mockService.findOne.mockResolvedValue({ id: 'route-1' });

      await controller.findOne('route-1');
      expect(mockService.findOne).toHaveBeenCalledWith('route-1');
    });
  });
});
