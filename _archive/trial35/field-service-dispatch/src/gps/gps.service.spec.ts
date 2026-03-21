import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GpsService', () => {
  let service: GpsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      gpsEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      technician: {
        update: vi.fn(),
        findMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GpsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GpsService>(GpsService);
  });

  describe('recordPosition', () => {
    it('should create GPS event and update technician position', async () => {
      const position = { technicianId: 't1', lat: 40.7128, lng: -74.006, accuracy: 10 };
      prisma.gpsEvent.create.mockResolvedValue({ id: 'gps-1', ...position, timestamp: new Date() });
      prisma.technician.update.mockResolvedValue({});

      const result = await service.recordPosition(position);
      expect(result.id).toBe('gps-1');
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { currentLat: 40.7128, currentLng: -74.006 },
      });
    });

    it('should handle position without accuracy', async () => {
      const position = { technicianId: 't1', lat: 40.7, lng: -74.0 };
      prisma.gpsEvent.create.mockResolvedValue({ id: 'gps-2', ...position, accuracy: undefined });
      prisma.technician.update.mockResolvedValue({});

      const result = await service.recordPosition(position);
      expect(result).toBeDefined();
    });
  });

  describe('getHistory', () => {
    it('should return GPS history for technician', async () => {
      prisma.gpsEvent.findMany.mockResolvedValue([
        { id: 'gps-1', lat: 40.7, lng: -74.0 },
      ]);
      const result = await service.getHistory('t1');
      expect(result).toHaveLength(1);
    });

    it('should filter by since date', async () => {
      const since = new Date('2024-01-01');
      prisma.gpsEvent.findMany.mockResolvedValue([]);
      await service.getHistory('t1', since);
      expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith({
        where: { technicianId: 't1', timestamp: { gte: since } },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });
    });

    it('should limit results to 100', async () => {
      prisma.gpsEvent.findMany.mockResolvedValue([]);
      await service.getHistory('t1');
      expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('getLatestPositions', () => {
    it('should return technicians with positions for company', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 't1', name: 'Bob', status: 'AVAILABLE', currentLat: 40.7, currentLng: -74.0 },
      ]);
      const result = await service.getLatestPositions('company-1');
      expect(result).toHaveLength(1);
      expect(result[0].currentLat).toBe(40.7);
    });

    it('should exclude technicians without GPS data', async () => {
      prisma.technician.findMany.mockResolvedValue([]);
      const result = await service.getLatestPositions('company-1');
      expect(result).toHaveLength(0);
      expect(prisma.technician.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          currentLat: { not: null },
          currentLng: { not: null },
        },
        select: expect.objectContaining({
          id: true,
          name: true,
          currentLat: true,
          currentLng: true,
        }),
      });
    });
  });
});
