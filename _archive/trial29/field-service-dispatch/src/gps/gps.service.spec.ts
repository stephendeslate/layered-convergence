import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  technician: {
    updateMany: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
};

describe('GpsService', () => {
  let service: GpsService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<GpsService>(GpsService);
  });

  describe('updateLocation', () => {
    it('should update technician location', async () => {
      mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.updateLocation('comp1', 't1', 40.7, -74.0);
      expect(result.count).toBe(1);
      expect(mockPrisma.technician.updateMany).toHaveBeenCalledWith({
        where: { id: 't1', companyId: 'comp1' },
        data: { currentLat: 40.7, currentLng: -74.0 },
      });
    });
  });

  describe('getLocations', () => {
    it('should return technicians with coordinates', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 't1', name: 'John', currentLat: 40.7, currentLng: -74.0, status: 'AVAILABLE' },
      ]);
      const result = await service.getLocations('comp1');
      expect(result).toHaveLength(1);
      expect(result[0].currentLat).toBe(40.7);
    });
  });

  describe('getTechnicianLocation', () => {
    it('should return single technician location', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({
        id: 't1',
        currentLat: 40.7,
        currentLng: -74.0,
      });
      const result = await service.getTechnicianLocation('comp1', 't1');
      expect(result?.id).toBe('t1');
    });

    it('should return null when technician not found', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue(null);
      const result = await service.getTechnicianLocation('comp1', 't999');
      expect(result).toBeNull();
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same coordinates', () => {
      const dist = service.calculateDistance(40.7, -74.0, 40.7, -74.0);
      expect(dist).toBe(0);
    });

    it('should calculate distance between two points', () => {
      const dist = service.calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
      expect(dist).toBeGreaterThan(3900);
      expect(dist).toBeLessThan(4000);
    });

    it('should return same distance regardless of direction', () => {
      const d1 = service.calculateDistance(0, 0, 10, 10);
      const d2 = service.calculateDistance(10, 10, 0, 0);
      expect(d1).toBeCloseTo(d2, 5);
    });
  });
});
