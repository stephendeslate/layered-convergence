import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { GpsService } from './gps.service';

const mockPrisma = {
  gpsEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  technician: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

describe('GpsService', () => {
  let service: GpsService;
  const companyId = 'company-1';

  beforeEach(() => {
    service = new GpsService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('record', () => {
    it('should record GPS event and update technician location', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-1',
        companyId,
      });
      mockPrisma.$transaction.mockResolvedValue([
        { id: 'gps-1', latitude: 40.7128, longitude: -74.006 },
        { id: 'tech-1' },
      ]);

      const result = await service.record(companyId, {
        technicianId: 'tech-1',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(result.latitude).toBe(40.7128);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid technician', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue(null);

      await expect(
        service.record(companyId, {
          technicianId: 'tech-999',
          latitude: 40.7128,
          longitude: -74.006,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for technician in different company', async () => {
      mockPrisma.technician.findUnique.mockResolvedValue({
        id: 'tech-1',
        companyId: 'other-company',
      });

      await expect(
        service.record(companyId, {
          technicianId: 'tech-1',
          latitude: 40.7128,
          longitude: -74.006,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLatestPositions', () => {
    it('should return technicians with positions', async () => {
      mockPrisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'John', latitude: 40.7128, longitude: -74.006, availability: 'AVAILABLE' },
      ]);

      const result = await service.getLatestPositions(companyId);
      expect(result).toHaveLength(1);
      expect(result[0].latitude).toBe(40.7128);
    });
  });
});
