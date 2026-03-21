import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TechnicianController } from './technician.controller';
import { TechnicianService } from './technician.service';
import { CompanyRequest } from '../common/middleware/company-context.middleware';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  findAvailable: vi.fn(),
  updateLocation: vi.fn(),
};

const mockReq = { companyId: 'company-1' } as CompanyRequest;

describe('TechnicianController', () => {
  let controller: TechnicianController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnicianController],
      providers: [{ provide: TechnicianService, useValue: mockService }],
    }).compile();

    controller = module.get<TechnicianController>(TechnicianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = { name: 'John', email: 'j@t.com', lat: 40.7, lng: -74.0, skills: ['plumbing'] };
      mockService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(mockReq, dto);
      expect(result.id).toBe('1');
      expect(mockService.create).toHaveBeenCalledWith('company-1', dto);
    });
  });

  describe('findAll', () => {
    it('should return all technicians', async () => {
      mockService.findAll.mockResolvedValue([{ id: '1' }]);
      const result = await controller.findAll(mockReq);
      expect(result).toHaveLength(1);
      expect(mockService.findAll).toHaveBeenCalledWith('company-1');
    });
  });

  describe('findAvailable', () => {
    it('should return available technicians', async () => {
      mockService.findAvailable.mockResolvedValue([{ id: '1', availability: 'AVAILABLE' }]);
      const result = await controller.findAvailable(mockReq);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a technician by id', async () => {
      mockService.findOne.mockResolvedValue({ id: '1' });
      const result = await controller.findOne(mockReq, '1');
      expect(result.id).toBe('1');
      expect(mockService.findOne).toHaveBeenCalledWith('1', 'company-1');
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      mockService.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await controller.update(mockReq, '1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('updateLocation', () => {
    it('should update technician location', async () => {
      mockService.updateLocation.mockResolvedValue({ id: '1', lat: 41.0, lng: -73.0 });
      const result = await controller.updateLocation(mockReq, '1', { lat: 41.0, lng: -73.0 });
      expect(result.lat).toBe(41.0);
    });
  });

  describe('remove', () => {
    it('should remove a technician', async () => {
      mockService.remove.mockResolvedValue({ id: '1' });
      const result = await controller.remove(mockReq, '1');
      expect(result.id).toBe('1');
    });
  });
});
