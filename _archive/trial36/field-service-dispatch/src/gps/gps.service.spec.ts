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

  it('should record a GPS position', async () => {
    const position = { technicianId: 't1', lat: 40.72, lng: -74.0 };
    prisma.gpsEvent.create.mockResolvedValue({ id: 'gps1', ...position });
    prisma.technician.update.mockResolvedValue({});

    const result = await service.recordPosition(position);
    expect(result.id).toBe('gps1');
  });

  it('should update technician location on recordPosition', async () => {
    const position = { technicianId: 't1', lat: 40.72, lng: -74.0, accuracy: 10 };
    prisma.gpsEvent.create.mockResolvedValue({ id: 'gps1', ...position });
    prisma.technician.update.mockResolvedValue({});

    await service.recordPosition(position);
    expect(prisma.technician.update).toHaveBeenCalledWith({
      where: { id: 't1' },
      data: { currentLat: 40.72, currentLng: -74.0 },
    });
  });

  it('should get GPS history for a technician', async () => {
    prisma.gpsEvent.findMany.mockResolvedValue([
      { id: 'gps1', technicianId: 't1' },
      { id: 'gps2', technicianId: 't1' },
    ]);

    const result = await service.getHistory('t1');
    expect(result).toHaveLength(2);
  });

  it('should filter history by since date', async () => {
    const since = new Date('2025-01-01');
    prisma.gpsEvent.findMany.mockResolvedValue([]);

    await service.getHistory('t1', since);
    expect(prisma.gpsEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          technicianId: 't1',
          timestamp: { gte: since },
        }),
      }),
    );
  });

  it('should get latest positions for a company', async () => {
    prisma.technician.findMany.mockResolvedValue([
      { id: 't1', name: 'Bob', currentLat: 40.72, currentLng: -74.0, status: 'AVAILABLE' },
    ]);

    const result = await service.getLatestPositions('company-1');
    expect(result).toHaveLength(1);
    expect(result[0].currentLat).toBe(40.72);
  });

  it('should only return technicians with non-null coordinates', async () => {
    prisma.technician.findMany.mockResolvedValue([]);
    await service.getLatestPositions('company-1');
    expect(prisma.technician.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          currentLat: { not: null },
          currentLng: { not: null },
        }),
      }),
    );
  });

  it('should record position with accuracy', async () => {
    const position = { technicianId: 't1', lat: 40.72, lng: -74.0, accuracy: 5.5 };
    prisma.gpsEvent.create.mockResolvedValue({ id: 'gps1', ...position });
    prisma.technician.update.mockResolvedValue({});

    await service.recordPosition(position);
    expect(prisma.gpsEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ accuracy: 5.5 }),
    });
  });
});
