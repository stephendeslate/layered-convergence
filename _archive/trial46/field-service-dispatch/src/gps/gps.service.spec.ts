import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GpsService } from './gps.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GpsService', () => {
  let service: GpsService;
  let prisma: any;
  const companyId = 'company-1';

  beforeEach(async () => {
    prisma = {
      gpsEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      technician: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
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
    it('should record a GPS position', async () => {
      const dto = { technicianId: 't1', lat: 40.7128, lng: -74.006 };
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.gpsEvent.create.mockResolvedValue({
        id: 'gps1', ...dto, timestamp: new Date(),
      });
      prisma.technician.update.mockResolvedValue({});

      const result = await service.recordPosition(companyId, dto);
      expect(result.id).toBe('gps1');
      expect(result.lat).toBe(40.7128);
    });

    it('should update technician current position', async () => {
      const dto = { technicianId: 't1', lat: 40.7128, lng: -74.006 };
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.gpsEvent.create.mockResolvedValue({ id: 'gps1', ...dto, timestamp: new Date() });
      prisma.technician.update.mockResolvedValue({});

      await service.recordPosition(companyId, dto);
      expect(prisma.technician.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { currentLat: 40.7128, currentLng: -74.006 },
      });
    });

    it('should throw NotFoundException if technician not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(
        service.recordPosition(companyId, { technicianId: 'missing', lat: 0, lng: 0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should pass accuracy when provided', async () => {
      const dto = { technicianId: 't1', lat: 40.7128, lng: -74.006, accuracy: 10 };
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.gpsEvent.create.mockResolvedValue({ id: 'gps1', ...dto, timestamp: new Date() });
      prisma.technician.update.mockResolvedValue({});

      await service.recordPosition(companyId, dto);
      expect(prisma.gpsEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ accuracy: 10 }),
      });
    });
  });

  describe('getHistory', () => {
    it('should return GPS history for a technician', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.gpsEvent.findMany.mockResolvedValue([
        { id: 'gps1', lat: 40.7128, lng: -74.006 },
      ]);

      const result = await service.getHistory(companyId, 't1');
      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if technician not found', async () => {
      prisma.technician.findFirst.mockResolvedValue(null);
      await expect(
        service.getHistory(companyId, 'missing'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should respect limit parameter', async () => {
      prisma.technician.findFirst.mockResolvedValue({ id: 't1', companyId });
      prisma.gpsEvent.findMany.mockResolvedValue([]);

      await service.getHistory(companyId, 't1', 10);
      expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('getLatestPositions', () => {
    it('should return technicians with GPS positions', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 't1', name: 'Tech 1', currentLat: 40.7128, currentLng: -74.006, status: 'AVAILABLE' },
        { id: 't2', name: 'Tech 2', currentLat: null, currentLng: null, status: 'AVAILABLE' },
      ]);

      const result = await service.getLatestPositions(companyId);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('t1');
    });

    it('should return empty array when no technicians have positions', async () => {
      prisma.technician.findMany.mockResolvedValue([
        { id: 't1', name: 'Tech 1', currentLat: null, currentLng: null, status: 'AVAILABLE' },
      ]);

      const result = await service.getLatestPositions(companyId);
      expect(result).toHaveLength(0);
    });
  });
});
