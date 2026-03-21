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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLocation', () => {
    it('should update technician location', async () => {
      mockPrisma.technician.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.updateLocation('comp-1', 'tech-1', 40.7, -74.0);
      expect(result.count).toBe(1);
      expect(mockPrisma.technician.updateMany).toHaveBeenCalledWith({
        where: { id: 'tech-1', companyId: 'comp-1' },
        data: { currentLat: 40.7, currentLng: -74.0 },
      });
    });
  });

  describe('getLocations', () => {
    it('should return all technicians with locations', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: '1', name: 'Tech', currentLat: 40.0, currentLng: -74.0, status: 'AVAILABLE' },
      ]);
      const result = await service.getLocations('comp-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getTechnicianLocation', () => {
    it('should return a technician location', async () => {
      mockPrisma.technician.findFirst.mockResolvedValue({
        id: '1',
        currentLat: 40.0,
        currentLng: -74.0,
      });
      const result = await service.getTechnicianLocation('comp-1', '1');
      expect(result?.currentLat).toBe(40.0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const dist = service.calculateDistance(40.7128, -74.006, 40.7228, -74.016);
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeLessThan(5);
    });

    it('should return 0 for same point', () => {
      const dist = service.calculateDistance(40.0, -74.0, 40.0, -74.0);
      expect(dist).toBe(0);
    });

    it('should handle large distances', () => {
      const dist = service.calculateDistance(0, 0, 90, 0);
      expect(dist).toBeGreaterThan(9000);
    });
  });
});
