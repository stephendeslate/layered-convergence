import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
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
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<TechniciansService>(TechniciansService);
  });

  describe('create', () => {
    it('should create a technician', async () => {
      const dto = { name: 'John', email: 'john@test.com', phone: '555-1234' };
      mockPrisma.technician.create.mockResolvedValue({ id: 't1', ...dto });
      const result = await service.create('comp1', dto);
      expect(result.name).toBe('John');
    });
  });

  describe('findAll', () => {
    it('should return all technicians for a company', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([{ id: 't1' }]);
      const result = await service.findAll('comp1');
      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      await service.findAll('comp1', 'AVAILABLE' as any);
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp1', status: 'AVAILABLE' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return technician when found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      const result = await service.findOne('comp1', 't1');
      expect(result.id).toBe('t1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp1', 't999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 't1', name: 'Jane' });
      const result = await service.update('comp1', 't1', { name: 'Jane' });
      expect(result.name).toBe('Jane');
    });
  });

  describe('updateLocation', () => {
    it('should update technician location', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      mockPrisma.technician.update.mockResolvedValue({ id: 't1', currentLat: 40.7, currentLng: -74.0 });
      const result = await service.updateLocation('comp1', 't1', 40.7, -74.0);
      expect(result.currentLat).toBe(40.7);
    });
  });

  describe('delete', () => {
    it('should delete technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: 't1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: 't1' });
      const result = await service.delete('comp1', 't1');
      expect(result.id).toBe('t1');
    });
  });
});
