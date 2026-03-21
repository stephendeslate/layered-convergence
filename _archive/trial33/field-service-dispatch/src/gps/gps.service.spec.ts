import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GpsService', () => {
  let service: GpsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      technician: {
        update: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      gpsEvent: {
        create: vi.fn(),
      },
    };
    service = new GpsService(prisma as unknown as PrismaService);
  });

  describe('updatePosition', () => {
    it('should update technician position and create gps event', async () => {
      const position = { technicianId: 'tech-1', lat: 40.0, lng: -74.0, timestamp: Date.now() };
      prisma.technician.update.mockResolvedValue({
        id: 'tech-1', companyId: 'c-1', currentLat: 40.0, currentLng: -74.0,
      });
      prisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1' });

      const result = await service.updatePosition(position);
      expect(result.currentLat).toBe(40.0);
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { currentLat: 40.0, currentLng: -74.0 },
      });
      expect(prisma.gpsEvent.create).toHaveBeenCalledWith({
        data: { technicianId: 'tech-1', lat: 40.0, lng: -74.0 },
      });
    });
  });

  describe('getPosition', () => {
    it('should return technician position', async () => {
      prisma.technician.findUnique.mockResolvedValue({
        id: 'tech-1', name: 'Tech', currentLat: 40.0, currentLng: -74.0, companyId: 'c-1',
      });

      const result = await service.getPosition('tech-1');
      expect(result!.currentLat).toBe(40.0);
      expect(result!.currentLng).toBe(-74.0);
    });

    it('should return null for non-existent technician', async () => {
      prisma.technician.findUnique.mockResolvedValue(null);
      const result = await service.getPosition('nope');
      expect(result).toBeNull();
    });
  });

  describe('getCompanyPositions', () => {
    it('should return positions for non-off-duty technicians', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 'tech-1', name: 'Tech 1', currentLat: 40.0, currentLng: -74.0, status: 'AVAILABLE' },
      ]);

      const result = await service.getCompanyPositions('c-1');
      expect(result).toHaveLength(1);
      expect(prisma.technician.findMany).toHaveBeenCalledWith({
        where: { companyId: 'c-1', status: { not: 'OFF_DUTY' } },
        select: {
          id: true, name: true, currentLat: true, currentLng: true, status: true,
        },
      });
    });
  });
});
