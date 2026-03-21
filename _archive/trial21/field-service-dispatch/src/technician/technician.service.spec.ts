import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TechnicianService } from './technician.service.js';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('TechnicianService', () => {
  let service: TechnicianService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TechnicianService(mockPrisma as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = { companyId: 'c1', name: 'Bob', email: 'bob@test.com', skills: ['plumbing'] };
      mockPrisma.technician.create.mockResolvedValue({ id: '1', ...dto });

      const result = await service.create(dto as any);
      expect(result.name).toBe('Bob');
    });
  });

  describe('findAllByCompany', () => {
    it('should return technicians by company', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([{ id: '1', name: 'Bob' }]);
      const result = await service.findAllByCompany('c1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith({ where: { companyId: 'c1' } });
    });
  });

  describe('findOne', () => {
    it('should return a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'Bob' });
      const result = await service.findOne('1', 'c1');
      expect(result.name).toBe('Bob');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'Bob' });
      mockPrisma.technician.update.mockResolvedValue({ id: '1', name: 'Robert' });

      const result = await service.update('1', 'c1', { name: 'Robert' } as any);
      expect(result.name).toBe('Robert');
    });

    it('should throw NotFoundException when updating non-existent', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.update('999', 'c1', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePosition', () => {
    it('should update technician position', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.update.mockResolvedValue({ id: '1', currentLat: 40.7, currentLng: -74.0 });

      const result = await service.updatePosition('1', 'c1', 40.7, -74.0);
      expect(result.currentLat).toBe(40.7);
    });
  });

  describe('remove', () => {
    it('should delete a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'c1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.remove('999', 'c1')).rejects.toThrow(NotFoundException);
    });
  });
});
