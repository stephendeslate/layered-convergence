import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TechnicianController } from './technician.controller.js';
import { TechnicianService } from './technician.service.js';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
};

describe('TechnicianController', () => {
  let controller: TechnicianController;
  const companyId = 'company-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [TechnicianController],
      providers: [{ provide: TechnicianService, useValue: mockService }],
    }).compile();

    controller = module.get<TechnicianController>(TechnicianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with companyId and dto', async () => {
      const dto = { name: 'John', email: 'john@test.com', skills: ['plumbing'] };
      const req = { companyId } as any;
      mockService.create.mockResolvedValue({ id: 'tech-1' });

      await controller.create(req, dto as any);
      expect(mockService.create).toHaveBeenCalledWith(companyId, dto);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with companyId', async () => {
      const req = { companyId } as any;
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(req);
      expect(mockService.findAll).toHaveBeenCalledWith(companyId);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with companyId and id', async () => {
      const req = { companyId } as any;
      mockService.findOne.mockResolvedValue({ id: 'tech-1' });

      await controller.findOne(req, 'tech-1');
      expect(mockService.findOne).toHaveBeenCalledWith(companyId, 'tech-1');
    });
  });

  describe('update', () => {
    it('should call service.update with companyId, id, and dto', async () => {
      const req = { companyId } as any;
      const dto = { name: 'Updated' };
      mockService.update.mockResolvedValue({ id: 'tech-1', name: 'Updated' });

      await controller.update(req, 'tech-1', dto as any);
      expect(mockService.update).toHaveBeenCalledWith(companyId, 'tech-1', dto);
    });
  });
});
