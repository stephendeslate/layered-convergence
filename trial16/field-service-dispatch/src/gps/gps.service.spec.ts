import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GpsService', () => {
  let service: GpsService;
  let prisma: {
    technician: {
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    gpsEvent: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  const companyId = 'company-1';

  const mockGpsEvent = {
    id: 'gps-1',
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10.5,
    heading: 180,
    speed: 25.5,
    technicianId: 'tech-1',
    companyId,
    recordedAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      technician: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      gpsEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };
    service = new GpsService(prisma as unknown as PrismaService);
  });

  describe('recordEvent', () => {
    it('should record a GPS event and update technician location', async () => {
      prisma.technician.findFirst.mockResolvedValue({
        id: 'tech-1',
        companyId,
      });
      prisma.gpsEvent.create.mockResolvedValue(mockGpsEvent);
      prisma.technician.update.mockResolvedValue({});

      const result = await service.recordEvent(companyId, {
        technicianId: 'tech-1',
        latitude: 40.7128,
        longitude: -74.006,
        accuracy: 10.5,
        heading: 180,
        speed: 25.5,
      });

      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
    });

    it('should create GPS event with correct data', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId });
      prisma.gpsEvent.create.mockResolvedValue(mockGpsEvent);
      prisma.technician.update.mockResolvedValue({});

      await service.recordEvent(companyId, {
        technicianId: 'tech-1',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(prisma.gpsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            latitude: 40.7128,
            longitude: -74.006,
            technicianId: 'tech-1',
            companyId,
          }),
        }),
      );
    });

    it('should update technician current location', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId });
      prisma.gpsEvent.create.mockResolvedValue(mockGpsEvent);
      prisma.technician.update.mockResolvedValue({});

      await service.recordEvent(companyId, {
        technicianId: 'tech-1',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 'tech-1' },
        data: { latitude: 40.7128, longitude: -74.006 },
      });
    });

    it('should throw NotFoundException for unknown technician', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.recordEvent(companyId, {
          technicianId: 'unknown',
          latitude: 40.7128,
          longitude: -74.006,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for technician from different company', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);

      await expect(
        service.recordEvent(companyId, {
          technicianId: 'tech-other-company',
          latitude: 40.7128,
          longitude: -74.006,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle optional accuracy, heading, speed', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 'tech-1', companyId });
      prisma.gpsEvent.create.mockResolvedValue({
        ...mockGpsEvent,
        accuracy: undefined,
        heading: undefined,
        speed: undefined,
      });
      prisma.technician.update.mockResolvedValue({});

      await service.recordEvent(companyId, {
        technicianId: 'tech-1',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(prisma.gpsEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            accuracy: undefined,
            heading: undefined,
            speed: undefined,
          }),
        }),
      );
    });
  });

  describe('findByTechnician', () => {
    it('should return GPS events for a technician', async () => {
      prisma.gpsEvent.findMany.mockResolvedValue([mockGpsEvent]);

      const result = await service.findByTechnician(companyId, 'tech-1');

      expect(result).toHaveLength(1);
      expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId, technicianId: 'tech-1' },
          orderBy: { recordedAt: 'desc' },
          take: 50,
        }),
      );
    });

    it('should respect custom limit', async () => {
      prisma.gpsEvent.findMany.mockResolvedValue([]);

      await service.findByTechnician(companyId, 'tech-1', 10);

      expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('should return empty array when no events exist', async () => {
      prisma.gpsEvent.findMany.mockResolvedValue([]);

      const result = await service.findByTechnician(companyId, 'tech-1');
      expect(result).toEqual([]);
    });
  });

  describe('getLatestLocations', () => {
    it('should return technicians with location data', async () => {
      prisma.technician.findMany.mockResolvedValue([
        {
          id: 'tech-1',
          name: 'John',
          latitude: 40.7128,
          longitude: -74.006,
          availability: 'AVAILABLE',
        },
      ]);

      const result = await service.getLatestLocations(companyId);

      expect(result).toHaveLength(1);
      expect(result[0].latitude).toBe(40.7128);
    });

    it('should filter by companyId', async () => {
      prisma.technician.findMany.mockResolvedValue([]);

      await service.getLatestLocations(companyId);

      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId }),
        }),
      );
    });

    it('should only return technicians with GPS coordinates', async () => {
      prisma.technician.findMany.mockResolvedValue([]);

      await service.getLatestLocations(companyId);

      expect(prisma.technician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            latitude: { not: null },
            longitude: { not: null },
          }),
        }),
      );
    });
  });
});
