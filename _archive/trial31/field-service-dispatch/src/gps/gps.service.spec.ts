import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  technician: {
    update: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
};

describe('GpsService', () => {
  let service: GpsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GpsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(GpsService);
    vi.clearAllMocks();
  });

  describe('updatePosition', () => {
    it('should update technician position', async () => {
      mockPrisma.technician.update.mockResolvedValue({
        id: 'tech-1',
        currentLat: 40.0,
        currentLng: -74.0,
      });

      const result = await service.updatePosition({
        technicianId: 'tech-1',
        lat: 40.0,
        lng: -74.0,
        timestamp: Date.now(),
      });

      expect(result.currentLat).toBe(40.0);
      expect(mockPrisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { currentLat: 40.0, currentLng: -74.0 },
      });
    });
  });

  describe('getPosition', () => {
    it('should return technician position', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-1',
        name: 'Alice',
        currentLat: 40.0,
        currentLng: -74.0,
        companyId: 'comp-1',
      });

      const result = await service.getPosition('tech-1');
      expect(result?.currentLat).toBe(40.0);
    });
  });

  describe('getCompanyPositions', () => {
    it('should return positions for active technicians', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', currentLat: 40.0, currentLng: -74.0, status: 'AVAILABLE' },
      ]);

      const result = await service.getCompanyPositions('comp-1');
      expect(result).toHaveLength(1);
    });
  });
});
