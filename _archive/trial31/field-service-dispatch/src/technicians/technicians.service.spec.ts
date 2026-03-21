import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from './technicians.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  technician: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('TechniciansService', () => {
  let service: TechniciansService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(TechniciansService);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = { name: 'John', email: 'john@test.com' };
      mockPrisma.technician.create.mockResolvedValue({ id: '1', ...dto });
      const result = await service.create('comp-1', dto);
      expect(result.name).toBe('John');
    });
  });

  describe('findAll', () => {
    it('should return technicians for company', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return technician when found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      const result = await service.findOne('comp-1', '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', '1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.update.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('comp-1', '1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });
  });

  describe('findAvailable', () => {
    it('should return available technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([{ id: '1', status: 'AVAILABLE' }]);
      const result = await service.findAvailable('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findNearest', () => {
    it('should return nearest technician', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: '1', currentLat: 40.1, currentLng: -74.1 },
        { id: '2', currentLat: 40.5, currentLng: -74.5 },
      ]);
      const result = await service.findNearest('comp-1', 40.0, -74.0);
      expect(result?.id).toBe('1');
    });

    it('should return null when no available technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      const result = await service.findNearest('comp-1', 40.0, -74.0);
      expect(result).toBeNull();
    });
  });
});
