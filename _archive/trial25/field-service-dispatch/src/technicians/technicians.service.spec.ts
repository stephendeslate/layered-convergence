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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a technician', async () => {
      mockPrisma.technician.create.mockResolvedValue({
        id: '1',
        name: 'Jane',
        email: 'jane@test.com',
      });
      const result = await service.create('comp-1', {
        name: 'Jane',
        email: 'jane@test.com',
      });
      expect(result.name).toBe('Jane');
    });

    it('should pass skills array', async () => {
      mockPrisma.technician.create.mockResolvedValue({ id: '1' });
      await service.create('comp-1', {
        name: 'Tech',
        email: 'tech@test.com',
        skills: ['HVAC', 'plumbing'],
      });
      expect(mockPrisma.technician.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ skills: ['HVAC', 'plumbing'] }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return technicians for company', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([{ id: '1' }]);
      const result = await service.findAll('comp-1');
      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([]);
      await service.findAll('comp-1', 'AVAILABLE');
      expect(mockPrisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'comp-1', status: 'AVAILABLE' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1', name: 'Jane' });
      const result = await service.findOne('comp-1', '1');
      expect(result.name).toBe('Jane');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      await expect(service.findOne('comp-1', 'bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLocation', () => {
    it('should update lat/lng', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.update.mockResolvedValue({
        id: '1',
        currentLat: 40.0,
        currentLng: -74.0,
      });
      const result = await service.updateLocation('comp-1', '1', 40.0, -74.0);
      expect(result.currentLat).toBe(40.0);
    });
  });

  describe('delete', () => {
    it('should delete a technician', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.technician.delete.mockResolvedValue({ id: '1' });
      const result = await service.delete('comp-1', '1');
      expect(result.id).toBe('1');
    });
  });
});
